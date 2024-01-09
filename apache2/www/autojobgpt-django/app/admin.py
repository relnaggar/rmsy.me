from django.contrib import admin
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .middleware import get_current_user
from .models import *


admin.site.register(LogEntry)
admin.site.register(CustomUser)
admin.site.register(Status)
admin.site.register(Template)
admin.site.register(FillField)
admin.site.register(Job)
admin.site.register(TailoredDocument)
admin.site.register(Substitution)

@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
  if sender == LogEntry:
    return

  user = get_current_user()
  if user is None or not user.is_authenticated:
    return

  LogEntry.objects.log_action(
    user_id=user.pk,
    content_type_id=ContentType.objects.get_for_model(instance).pk,
    object_id=instance.pk,
    object_repr=str(instance),
    action_flag=ADDITION if created else CHANGE
  )

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
  if sender == LogEntry:
    return

  user = get_current_user()
  if user is None or not user.is_authenticated:
    return

  LogEntry.objects.log_action(
    user_id=user.pk,
    content_type_id=ContentType.objects.get_for_model(instance).pk,
    object_id=instance.pk,
    object_repr=str(instance),
    action_flag=DELETION
  )
