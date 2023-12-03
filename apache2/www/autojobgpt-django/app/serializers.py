from rest_framework import serializers

from .models import Job, ResumeTemplate, FillField, Resume, ResumeSubstitution
from .models import DEFAULT_FILLFIELDS


class JobURLSerializer(serializers.ModelSerializer):
  class Meta:
    model = Job
    fields = ['url']
    extra_kwargs = {'url': {'required': True}}

class JobDetailsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Job
    fields = ['title', 'company', 'posting']

class JobSerializer(serializers.ModelSerializer):
  class Meta:
    model = Job
    fields = "__all__"
    extra_kwargs = {'chat_messages': {'read_only': True}}


class FillFieldSerializer(serializers.ModelSerializer):
  class Meta:
    model = FillField
    fields = "__all__"
    extra_kwargs = {
      'template': {'read_only': True},
      'key': {'read_only': True},
    }

class ResumeTemplateSerializer(serializers.ModelSerializer):
  fillFields = FillFieldSerializer(many=True, read_only=True)

  class Meta:
    model = ResumeTemplate
    fields = "__all__"
    extra_kwargs = {
      'png': {'read_only': True}
    }


class RegenerateSerializer(serializers.Serializer):
  value = serializers.CharField(allow_blank=True)
  feedback = serializers.CharField(required=False)

class ResumeSubstitutionSerializer(serializers.ModelSerializer):
  class Meta:
    model = ResumeSubstitution
    fields = "__all__"
    extra_kwargs = {
      'resume': {'read_only': True},
      'key': {'read_only': True},
    }

class ResumeSerializer(serializers.ModelSerializer):
  substitutions = serializers.SerializerMethodField()
  job_details = JobSerializer(source='job', read_only=True)
  template_details = ResumeTemplateSerializer(source='template', read_only=True)
  
  class Meta:
    model = Resume
    fields = "__all__"
    extra_kwargs = {
      'name': {'required': False},
      'version': {'read_only': True},
      'docx': {'read_only': True},
      'png': {'read_only': True},  
      'chat_messages': {'read_only': True},
    }

  def get_substitutions(self, obj):
    substitutions = [
      s for s in obj.substitutions.all() if s.key in DEFAULT_FILLFIELDS.keys()
    ] + [
      s for s in obj.substitutions.all() if s.key not in DEFAULT_FILLFIELDS.keys()
    ]
    return ResumeSubstitutionSerializer(substitutions, many=True).data

  def to_representation(self, instance):
    representation = super().to_representation(instance)
    representation['job'] = representation.pop('job_details')
    representation['template'] = representation.pop('template_details')
    return representation
