from django.contrib.auth.models import AbstractUser

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