#!/usr/bin/python
# ex:set fileencoding=utf-8:

from __future__ import unicode_literals

from django.core.urlresolvers import reverse_lazy
from django.http import Http404
from django.http import HttpResponseRedirect
from django.views.generic import View

from djangobmf.views import ModuleCreateView
from djangobmf.views import ModuleUpdateView
from djangobmf.views import ModuleViewMixin

import re
import datetime

from .forms import PositionForm

from .models import Position


class PositionCreateView(ModuleCreateView):
    form_class = PositionForm

    def get_initial(self):
        self.initial.update({
            'date': datetime.datetime.now(),
            'employee': self.request.user.djangobmf.employee,
        })
        return super(PositionCreateView, self).get_initial()


class PositionUpdateView(ModuleUpdateView):
    form_class = PositionForm


class PositionAPI(ModuleViewMixin, View):
    model = Position

    def get_success_url(self):
        # TODO: Does not work, please convert this view to an ajax-call
        return reverse_lazy('%s:index' % self.model._bmfmeta.url_namespace)

    def get_permissions(self, perms):
        info = self.model._meta.app_label, self.model._meta.model_name
        perms.append('%s.view_%s' % info)
        mdl = self.model._meta.get_field('invoice').rel.to
        info = mdl._meta.app_label, mdl._meta.model_name
        perms.append('%s.create_%s' % info)
        return super(PositionAPI, self).get_permissions(perms)

    def get(self, request, *args, **kwargs):
        raise Http404

    def post(self, request, *args, **kwargs):
        pks = []
        for key in self.request.POST:
            match = re.match(r'pk\.([0-9]+)', key)
            if match:
                pks.append(int(match.groups()[0]))
        if len(pks) > 0:
            self.make_invoices(pks)
        return HttpResponseRedirect(self.get_success_url())

    def modify_invoice_queryset(self, qs):
        # Overwrite this to change the order in which the items are added to the invoice
        return qs.order_by('date')

    def modify_invoice_item(self, obj, position):
        # Overwrite this to change the data which is added to the invoice
        obj.name = position.name
        obj.description = position.description
        return obj

    def create_invoice(self, project, qs):
        invoice = self.model._meta.get_field('invoice').rel.to
        products = invoice.products.through
        inv = invoice(project=project)
        inv.clean()
        inv.save()
        for item in qs:
            invitem = products(invoice=inv, product=item.product, amount=item.amount, price=item.price)
            invitem = self.modify_invoice_item(invitem, item)
            invitem.save()
            item.invoice = inv
            item.changed_by = self.request.user
            item.save()

    def make_invoices(self, pks):
        qs = self.model.objects.filter(invoice__isnull=True, pk__in=pks)
        qs = self.modify_invoice_queryset(qs)
        items = qs.select_related('project').only('project')
        done = []
        for item in items:
            if item.project.pk in done:
                continue
            done.append(item.project.pk)
            self.create_invoice(item.project, qs.filter(project=item.project))
