from django.contrib import admin

from .models import *

admin.site.register(CustomUser)
admin.site.register(Status)
admin.site.register(Template)
admin.site.register(FillField)
admin.site.register(Job)
admin.site.register(TailoredDocument)
admin.site.register(Substitution)