from threading import local


_user = local()

def get_current_user():
  return getattr(_user, 'current_user', None)

class CurrentUserMiddleware:
  def __init__(self, get_response):
    self.get_response = get_response

  def __call__(self, request):
    _user.current_user = getattr(request, 'user', None)
    response = self.get_response(request)
    return response
