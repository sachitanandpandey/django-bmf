#!/usr/bin/python
# ex:set fileencoding=utf-8:

from __future__ import unicode_literals

from django.utils.translation import ugettext_lazy as _

from djangobmf.currency import BaseCurrency
from djangobmf.sites import register


@register
class EUR(BaseCurrency):
    iso = "EUR"
    symbol = _("€")
    name = _("Euro")
