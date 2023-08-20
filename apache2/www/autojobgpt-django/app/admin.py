from django.contrib import admin

from .models import *

admin.site.register(JobPosting)
admin.site.register(JobRequirement)
admin.site.register(Prompt)