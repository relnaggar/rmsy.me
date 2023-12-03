from rest_framework import serializers

from .models import ResumeTemplate, FillField, Job, Resume, ResumeSubstitution


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

class ResumeTemplateSerializer(serializers.ModelSerializer):
  fillFields = FillFieldSerializer(many=True, read_only=True)

  class Meta:
    model = ResumeTemplate
    fields = "__all__"
    extra_kwargs = {'png': {'required': False}}

class RegenerateSerializer(serializers.Serializer):
  value = serializers.CharField()
  feedback = serializers.CharField(required=False)

class ResumeSubstitutionSerializer(serializers.ModelSerializer):  
  def update(self, instance, validated_data):
    instance = super().update(instance, validated_data)
    instance.resume.generate_docx()
    instance.resume.generate_png()
    return instance

  class Meta:
    model = ResumeSubstitution
    fields = "__all__"

class ResumeSerializer(serializers.ModelSerializer):
  substitutions = ResumeSubstitutionSerializer(many=True, read_only=True)
  job_details = JobSerializer(source='job', read_only=True)
  template_details = ResumeTemplateSerializer(source='template', read_only=True)
  
  class Meta:
    model = Resume
    fields = "__all__"
    extra_kwargs = {
      'name': {'required': False},
      'docx': {'required': False},
      'png': {'required': False},      
    }

  # override to_representation to return job_details as job instead of just the id
  def to_representation(self, instance):
    representation = super().to_representation(instance)
    representation['job'] = representation.pop('job_details')
    representation['template'] = representation.pop('template_details')
    return representation