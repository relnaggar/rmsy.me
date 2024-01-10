from django.contrib.auth.models import AbstractUser
from django.contrib.admin.models import LogEntry

from rest_framework.authtoken.models import Token


class CustomUser(AbstractUser):
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    super().save(*args, **kwargs)
    Token.objects.create(user=self)
  
  def __update(self, *args, **kwargs):
    super().save(*args, **kwargs)

  def delete(self, *args, **kwargs):
    logs = LogEntry.objects.filter(user_id=self.pk)
    for log in logs:
      log.change_message = f"Action by deleted user: {self.username}"
      log.user = CustomUser.objects.get(pk=1)
      log.save()
    super().delete(*args, **kwargs)