from rest_framework import serializers

from .models import CustomUser
from .models import Status, Technology, TechnologyForJob, Job, Template, FillField, TailoredDocument, Substitution
from .models import DocumentType
from .models import DEFAULT_FILLFIELDS


class EmptySerializer(serializers.Serializer):
  pass


class CustomUserSerializer(serializers.ModelSerializer):
  agree = serializers.BooleanField(write_only=True, required=True)

  class Meta:
    model = CustomUser
    fields = ["username", "password", "agree"]
    extra_kwargs = {
      "password": {"write_only": True, "style": {"input_type": "password"}},
    }

  def validate_agree(self, value):
    if not value:
      raise serializers.ValidationError("You must agree to proceed.")
    return value

  def create(self, validated_data):
    del validated_data["agree"]
    return CustomUser.objects.create_user(**validated_data)


class StatusSerializer(serializers.ModelSerializer):
  class Meta:
    model = Status
    fields = ["id", "name", "order"]
    extra_kwargs = {
      "order": {"required": False},
    }

class TechnologySerializer(serializers.ModelSerializer):
  class Meta:
    model = Technology
    fields = ["id", "name", "proficient"]

class JobURLSerializer(serializers.ModelSerializer):
  class Meta:
    model = Job
    fields = ["url"]

class JobDetailsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Job
    fields = ["title", "company", "posting"]

class JobPostingSerializer(serializers.ModelSerializer):
  class Meta:
    model = Job
    fields = ["posting"]

class JobTechnologiesSerializer(serializers.Serializer):
  required_technologies = serializers.ListField(child=serializers.CharField())
  nice_to_have_technologies = serializers.ListField(child=serializers.CharField())

class JobSerializer(serializers.ModelSerializer):
  required_technologies = serializers.PrimaryKeyRelatedField(many=True, queryset=Technology.objects.all(), required=False, write_only=True)
  nice_to_have_technologies = serializers.PrimaryKeyRelatedField(many=True, queryset=Technology.objects.all(), required=False, write_only=True)

  class Meta:
    model = Job
    fields = ["id", "url", "title", "company", "posting", "status", "chosen_resume", "notes", "required_technologies", "nice_to_have_technologies"]
    extra_kwargs = {
      "status": {"required": False},
      "chat_messages": {"read_only": True},
    }
  
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    request = self.context.get('request', None)
    if request and request.user:
      self.fields['status'].queryset = Status.objects.filter(user=request.user)
      self.fields['chosen_resume'].queryset = TailoredDocument.objects.filter(user=request.user, type=DocumentType.RESUME)
      technology_queryset = Technology.objects.filter(user=request.user)
      self.fields['required_technologies'].queryset = technology_queryset
      self.fields['nice_to_have_technologies'].queryset = technology_queryset

  def create(self, validated_data):
    required_technologies = validated_data.pop("required_technologies")
    nice_to_have_technologies = validated_data.pop("nice_to_have_technologies")
    job = Job.objects.create(**validated_data)
    for technology in required_technologies:
      TechnologyForJob.objects.create(job=job, technology=technology, required=True)
    for technology in nice_to_have_technologies:
      TechnologyForJob.objects.create(job=job, technology=technology, required=False)
    return job
  
  def update(self, instance, validated_data):
    required_technologies = validated_data.pop("required_technologies")
    nice_to_have_technologies = validated_data.pop("nice_to_have_technologies")
    instance = super().update(instance, validated_data)
    TechnologyForJob.objects.filter(job=instance).delete()
    for technology in required_technologies:
      TechnologyForJob.objects.create(job=instance, technology=technology, required=True)
    for technology in nice_to_have_technologies:
      TechnologyForJob.objects.create(job=instance, technology=technology, required=False)
    return instance
  
  def to_representation(self, instance):
    representation = super().to_representation(instance)
    required_technologies_qs = TechnologyForJob.objects.filter(job=instance, required=True, technology__user=instance.user)
    nice_to_have_technologies_qs = TechnologyForJob.objects.filter(job=instance, required=False, technology__user=instance.user)
    representation["required_technologies"] = TechnologySerializer([technology_for_job.technology for technology_for_job in required_technologies_qs], many=True).data
    representation["nice_to_have_technologies"] = TechnologySerializer([technology_for_job.technology for technology_for_job in nice_to_have_technologies_qs], many=True).data    
    return representation


class FillFieldSerializer(serializers.ModelSerializer):
  class Meta:
    model = FillField
    fields = ["id", "key", "description", "template"]
    extra_kwargs = {
      "template": {"read_only": True},
      "key": {"read_only": True},
    }

class TemplateSerializer(serializers.ModelSerializer):
  fill_fields = FillFieldSerializer(many=True, read_only=True)
  paragraphs = serializers.SerializerMethodField()

  class Meta:
    model = Template
    fields = ["id", "docx", "png", "name", "additional_information", "type", "fill_fields", "paragraphs"]
    extra_kwargs = {
      "png": {"read_only": True},
    }

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    if self.instance is not None: # update
      self.fields["type"].read_only = True # type is read-only after creation

  def get_paragraphs(self, obj):
    text = obj.extract_text()
    return text.split("\n") if text else []


class RegenerateSerializer(serializers.Serializer):
  value = serializers.CharField(allow_blank=True)
  feedback = serializers.CharField(required=False)

class SubstitutionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Substitution
    fields = ["id", "key", "value", "tailored_document"]
    extra_kwargs = {
      "tailored_document": {"read_only": True},
      "key": {"read_only": True},
    }

class TailoredDocumentSerializer(serializers.ModelSerializer):
  substitutions = serializers.SerializerMethodField()
  job_details = JobSerializer(source="job", read_only=True)
  template_details = TemplateSerializer(source="template", read_only=True)
  
  class Meta:
    model = TailoredDocument
    fields = ["id", "name", "version", "docx", "png", "template", "type", "job", "job_details", "substitutions", "template_details"]
    extra_kwargs = {
      "name": {"required": False},
      "version": {"read_only": True},
      "docx": {"read_only": True},
      "png": {"read_only": True},
    }

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    if self.instance is not None:
      self.fields["type"].read_only = True # type is read-only after creation
    request = self.context.get('request', None)
    if request and request.user:
      self.fields['job'].queryset = Job.objects.filter(user=request.user)
      self.fields['template'].queryset = Template.objects.filter(user=request.user)

  def get_substitutions(self, obj):
    substitutions = [
      s for s in obj.substitutions.all() if s.key in DEFAULT_FILLFIELDS.keys()
    ] + [
      s for s in obj.substitutions.all() if s.key not in DEFAULT_FILLFIELDS.keys()
    ]
    return SubstitutionSerializer(substitutions, many=True).data

  def to_representation(self, instance):
    representation = super().to_representation(instance)
    representation["job"] = representation.pop("job_details")
    representation["template"] = representation.pop("template_details")
    return representation