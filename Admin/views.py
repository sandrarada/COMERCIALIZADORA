from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import PasswordResetForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
#from .models import CustomUserCreationForm

from django.views.generic import *
from django.http import HttpResponse
#importamos las urls de la app products
from Products.urls import urlpatterns

#importamos los modelos
from Products.models import *



@login_required
def adminHome(request):

    user = request.session.get('user', None)#obtenemos el usuario de la sesion


    return render(request, 'adminHome.html', {'user': user})


class CategoriesView(TemplateView):
    template_name = "dashboard/Pages/categories.html"

class ProductsView(TemplateView):
    template_name = "dashboard/Pages/Products.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["categorias"] = Categories.objects.all()

        return context




class AccountSettingsView(TemplateView):
    template_name = 'dashboard/Pages/Account.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Configuracion de Cuenta'
        return context


from django.shortcuts import get_object_or_404

def LoginUser(request):
    print('hola'*10)
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            if user.is_superuser:
                request.session['user'] = user.id
                return redirect('adminHome')
            else:
                request.session['user'] = user.id
                # Verificar si el usuario ya tiene un carrito
                cart = Cart.objects.filter(user=user).first()
                
                if not cart:
                    # Crear un carrito para el usuario si no tiene uno
                    cart = Cart(user=user)
                    cart.save()
                
                return redirect('home')
        else:
            return redirect('login')
    
    return render(request, 'registration/login.html')



def password_reset_request(request):
    if request.method == "POST":
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            form.save(
                # Aquí podrías añadir algunos parámetros adicionales si es necesario
                # por ejemplo, email_template_name='my_custom_email_template.html'
            )
            messages.success(request, 'Se ha enviado un correo con instrucciones para restablecer la contraseña.')
            return render(request, 'password_reset_request.html', {'form': form})
        else:
            messages.error(request, 'Ocurrió un error. Por favor, intenta de nuevo.')
    else:
        form = PasswordResetForm()
    return render(request, 'registration/recovery.html', {'form': form})


def registrar(request):

    
    '''
    if request.method == 'POST':

        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')  # Redirigir al login después del registro exitoso
    else:
        form = UserCreationForm()'''
    
    
    #return render(request, 'registration/register.html', {'form': form})
    #return render(request, 'registration/register.html', {})

    return HttpResponse("holaaaaa")
    pass

def userLogout(request):

    logout(request)

    return redirect('login')




'''def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        print(form)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        form = CustomUserCreationForm()
    return render(request, "ejemplo.html", {"form": form})
'''
