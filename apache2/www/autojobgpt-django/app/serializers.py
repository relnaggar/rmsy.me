from rest_framework import serializers

from .models import ResumeTemplate, JobPosting, Resume

class ResumeTemplateSerializer(serializers.ModelSerializer):
  class Meta:
    model = ResumeTemplate
    fields = "__all__"

class JobPostingSerializer(serializers.ModelSerializer):
  class Meta:
    model = JobPosting
    fields = "__all__"

class ResumeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Resume
    fields = "__all__"
    extra_kwargs = {'upload': {'required': False}}