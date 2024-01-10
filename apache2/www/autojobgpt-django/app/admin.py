from django.contrib import admin
from django.contrib.admin.models import LogEntry
# from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
# from django.contrib.contenttypes.models import ContentType
# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver

# from .middleware import get_current_user
from .models import CustomUser, Status, Template, FillField, Job, TailoredDocument, Substitution


admin.site.register(LogEntry)
admin.site.register(CustomUser)
admin.site.register(Status)
admin.site.register(Template)
admin.site.register(FillField)
admin.site.register(Job)
admin.site.register(TailoredDocument)
admin.site.register(Substitution)

# @receiver(post_save)
# def log_save(sender, instance, created, **kwargs):
#   if 'raw' in kwargs and kwargs['raw']:
#     return
  
#   if sender == LogEntry:
#     return

#   user = get_current_user()
#   if user is None or not user.is_authenticated:
#     user_id = 1
#   else:
#     user_id = user.pk

#   try:  
#     LogEntry.objects.log_action(
#       user_id=user_id,
#       content_type_id=ContentType.objects.get_for_model(instance).pk,
#       object_id=instance.pk,
#       object_repr=str(instance),
#       action_flag=ADDITION if created else CHANGE
#     )
#   except:
#     pass

# @receiver(post_delete)
# def log_delete(sender, instance, **kwargs):  
#   if sender == LogEntry:
#     return

#   user = get_current_user()
#   if user is None or not user.is_authenticated or (isinstance(instance, CustomUser) and instance.pk == user.pk):
#     user_id = 1
#   else:
#     user_id = user.pk

#   LogEntry.objects.log_action(
#     user_id=user_id,
#     content_type_id=ContentType.objects.get_for_model(instance).pk,
#     object_id=instance.pk,
#     object_repr=str(instance),
#     action_flag=DELETION
#   )