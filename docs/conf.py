# -*- coding: utf-8 -*-
import sys, os

sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.abspath('..'))
sys.path.insert(0, os.path.join(os.path.abspath('.'), '_ext'))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sandbox.settings")

# setup Django
import django
if hasattr(django,'setup'):
    django.setup()
else:
    print dir(django)
    print django.get_version()

# -- General configuration -----------------------------------------------------

# Add any Sphinx extension module names here, as strings.
extensions = [
    'sphinx.ext.autodoc',
#   'sphinx.ext.doctest',
#   'sphinx.ext.intersphinx',
#   'sphinx.ext.todo',
#   'sphinx.ext.coverage',
#   'sphinx.ext.viewcode',
    'sphinx.ext.extlinks',
    'djangobmfdocs',
]

# The suffix of source filenames.
source_suffix = '.rst'

# The encoding of source files.
source_encoding = 'utf-8'

# The master toctree document.
master_doc = 'index'

# General information about the project.
project = u'django BMF'
copyright = u'2013, Sebastian Braun'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
version = "0.1"
release = "alpha"

# The language for content autogenerated by Sphinx. Refer to documentation for
# a list of supported languages.
language = "en"

# List of directories, relative to source directory, that shouldn't be
# searched for source files.
exclude_trees = ['build']

# If true, '()' will be appended to :func: etc. cross-reference text.
add_function_parentheses = True

# If true, the current module name will be prepended to all description unit
# titles (such as .. function::).
add_module_names = True

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

# -- Options for HTML output ---------------------------------------------------

import sphinx_rtd_theme
html_theme = 'sphinx_rtd_theme'
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]

html_static_path = ['static']
