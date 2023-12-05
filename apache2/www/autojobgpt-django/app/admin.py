from django.contrib import admin

from .models import *

admin.site.register(Template)
admin.site.register(FillField)
admin.site.register(Job)
admin.site.register(Resume)
admin.site.register(Substitution)