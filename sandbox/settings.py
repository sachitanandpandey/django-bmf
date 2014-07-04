# Django settings

import os
gettext = lambda s: s
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))

ADMINS = (
    ('Sebastian Braun', 'sebastian@elmnt.de'),
)

INTERNAL_IPS = ('127.0.0.1', '85.25.139.15')
ALLOWED_HOSTS = ["erp.igelware.de", "127.0.0.1"]

MANAGERS = ADMINS

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Europe/Berlin'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'de'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_PATH, "media")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(PROJECT_PATH, "static")

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
)

ROOT_URLCONF = 'sandbox.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_PATH, "templates"),
)


TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.contrib.messages.context_processors.messages',
    'sekizai.context_processors.sekizai',
)

TEST_PROJECT_APPS = (
    'djangoerp',
    'djangoerp.contrib.accounting',
    'djangoerp.contrib.address',
    'djangoerp.contrib.customer',
    'djangoerp.contrib.document',
    'djangoerp.contrib.employee',
    'djangoerp.contrib.invoice',
    'djangoerp.contrib.position',
    'djangoerp.contrib.product',
    'djangoerp.contrib.project',
    'djangoerp.contrib.quotation',
#   'djangoerp.contrib.shipment',
#   'djangoerp.contrib.stock',
    'djangoerp.contrib.task',
    'djangoerp.contrib.taxing',
#   'djangoerp.contrib.team',
#   'djangoerp.contrib.timesheet',
    'djangoerp.currencies.EUR',
    'djangoerp.currencies.USD',
    'djangoerp.reports.xhtml2pdf',
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'mptt',
    'sekizai',
)
INSTALLED_APPS += TEST_PROJECT_APPS

LANGUAGES = (
    (u'de', 'Deutsch'),
    (u'en', 'English'),
)

DEFAULT_FROM_EMAIL = "team@igelware.de"
SERVER_EMAIL = "noreply@igelware.de"

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake-439478'
  }
}

# DJANGO JENKINS ==================================================================

JENKINS_TASKS = (
    'django_jenkins.tasks.with_coverage',
    'django_jenkins.tasks.run_pylint',
    'django_jenkins.tasks.run_pep8',
)

# ERP =============================================================================

ERP_DOCUMENT_ROOT = os.path.join(PROJECT_PATH, "erp_documents")
ERP_DOCUMENT_URL = '/erp_documents/'

# CELERY ==========================================================================

#import djcelery
#djcelery.setup_loader()
#CELERY_SEND_TASK_ERROR_EMAIL=True # ?????

# LOCAL SETTINGS ==================================================================

try:
  from local_settings import *
except ImportError:
  SECRET_KEY = 'just-a-dummy-key-overwrite-it-in:local_settings.py'
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.sqlite3',
          'NAME': '%s/database.sqlite' % PROJECT_PATH,
          'USER': '',
          'PASSWORD': '',
          'HOST': '',
          'PORT': '',
    }
  }
  DEBUG = True
  TEMPLATE_DEBUG = DEBUG
  EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
  CELERY_ALWAYS_EAGER=True # deactivate celery


  INSTALLED_APPS += (
    'discover_jenkins',
#   'django_extensions',
#   'debug_toolbar',
  )
  TEST_RUNNER = 'django.test.runner.DiscoverRunner'
# TEST_RUNNER = 'discover_jenkins.runner.DiscoverCIRunner'
# MIDDLEWARE_CLASSES += (
#   'debug_toolbar.middleware.DebugToolbarMiddleware',
# )
  DEBUG_TOOLBAR_CONFIG = {
      'INTERCEPT_REDIRECTS': False,
  }

# LOGGING =========================================================================

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
