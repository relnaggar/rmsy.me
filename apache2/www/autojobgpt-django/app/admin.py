from django.contrib import admin
from django.contrib.admin.models import LogEntry

from .models import CustomUser, Status, Template, FillField, Job, TailoredDocument, Substitution


admin.site.register(LogEntry)
admin.site.register(CustomUser)
admin.site.register(Status)
admin.site.register(Template)
admin.site.register(FillField)
admin.site.register(Job)
admin.site.register(TailoredDocument)
admin.site.register(Substitution)