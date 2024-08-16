from django.shortcuts import render, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse
from .models import *

from django.http import JsonResponse

from django.views.generic import *
# Create your views here.

#importamos excepcion para inhabilitar el csrf
from django.views.decorators.csrf import csrf_exempt

#importamos errores 
from django.shortcuts import get_object_or_404

def home(request):
    
    productos = Product.objects.all()

    return render(request, 'products/homeProducts.html', {'productos': productos})


from django.views.generic import *
# Create your views here.



#Creamos TemplateView
class HomeListView(TemplateView):
    
    template_name = 'products/homeProducts.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        all_products = Product.objects.all()

        # Filtros
        category_filter = self.request.GET.get('category', None)
        color_filter = self.request.GET.get('color', None)
        size_filter = self.request.GET.get('size', None)

        if category_filter:
            all_products = all_products.filter(category=category_filter)
        if color_filter:
            all_products = all_products.filter(color=color_filter)
        if size_filter:
            all_products = all_products.filter(size=size_filter)


        # Paginación
        paginator = Paginator(all_products, 6)  # 4 productos por página
        page = self.request.GET.get('page')

        try:
            products = paginator.page(page)
        except PageNotAnInteger:
            products = paginator.page(1)
        except EmptyPage:
            products = paginator.page(paginator.num_pages)

        
        context["productos"] = products
        context["categorias"] = Categories.objects.all()

        return context

#Endpoints de la API de Carrito

def CartList(request):

    if request.method == 'GET':

        session_user = request.session.get('user', None)

        if not Cart.objects.filter(user=session_user).exists():
                return redirect('login')
        else:   
                # Si existe una sesión activa, obtenemos el carrito
                cart = Cart.objects.get(user=request.user)
                # Obtenemos los items del carrito
                items = CartItem.objects.filter(cart=cart)
                # Obtenemos el total de items
                total_items = items.count()
                # Obtenemos el total de la compra
                total = 0
                
                
                for item in items:
                    total += item.product.price * item.quantity
                #enviamos los datos a mostrar en el template del usuario    
                context = {
                    'cart': cart,
                    'items': items,
                    'total_items':total_items,
                    'total': total
                    }

                return  render(request, 'components/carrito.html',context)


def addCart(request, id):
    if request.method == 'GET':
        # Obtenemos el usuario de la sesión
        session_user = request.session.get('user', None)
        # Si no existe una sesión activa, redirigimos al login
        if not session_user:
            return redirect('login')
        else:
            # Si existe una sesión activa, obtenemos el carrito
            cart = Cart.objects.get(user=session_user)
            # Obtenemos el producto
            product = Product.objects.get(pk=id)
            # Obtenemos el item del carrito
            item = CartItem.objects.filter(cart=cart, product=product).first()
            # Si el item existe, aumentamos la cantidad
            if item:
                item.quantity += 1
                item.save()
            # Si no existe, lo creamos
            else:
                item = CartItem(
                    cart=cart,
                    product=product
                )
                item.save()
            # Redirigimos al carrito
            return redirect('cart')


def addOneItemCart(request, id):
    if request.method == 'GET':
        # Obtenemos el usuario de la sesión
        session_user = request.session.get('user', None)
        # Si no existe una sesión activa, redirigimos al login
        if not session_user:
            return redirect('login')
        else:
            # Si existe una sesión activa, obtenemos el carrito
            cart = Cart.objects.get(user=session_user)
            # Obtenemos el producto
            product = Product.objects.get(pk=id)
            # Obtenemos el item del carrito
            item = CartItem.objects.filter(cart=cart, product=product).first()
            # Si el item existe, aumentamos la cantidad
            if item:
                item.quantity += 1
                item.save()
            # Si no existe, lo creamos
            else:
                item = CartItem(
                    cart=cart,
                    product=product
                )
                item.save()
            # Redirigimos al carrito
            return redirect('cart')

def removeCart(request, id):
    if request.method == 'GET':
        # Obtenemos el usuario de la sesión
        session_user = request.session.get('user', None)
        # Si no existe una sesión activa, redirigimos al login
        if not session_user:
            return redirect('login')
        else:
            # Si existe una sesión activa, obtenemos el carrito
            cart = Cart.objects.get(user=session_user)
            # Obtenemos el producto
            product = Product.objects.get(pk=id)
            # Obtenemos el item del carrito
            item = CartItem.objects.filter(cart=cart, product=product).first()
            # Si el item existe, aumentamos la cantidad
            if item:
                item.quantity -= 1
                item.save()
                if item.quantity == 0:
                    item.delete()
                    
            # Redirigimos al carrito
            return redirect('cart')


#Endpoints de la API de categorias
def getCategories(request):
    if request.method == 'GET':
        categories = list(Categories.objects.values())

        data = {
            'categories': categories
        }

        return JsonResponse(data)


def updateCategories(request, id):
    categoria = Categories.objects.get(pk=id)

    if request.method == 'POST':
        nuevo_nombre = request.POST.get('nombre_categoria')

        if nuevo_nombre:
            categoria.name_categories = nuevo_nombre
            categoria.save()

            return JsonResponse({'ok': True})
        else:
            return JsonResponse({'ok': False, 'error': 'El nombre de la categoría no puede estar vacío'}, status=400)

    return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)



def createCategories(request):

    if request.method == 'POST':
        nombre_categoria = request.POST.get('nombre_categoria')

        if nombre_categoria:
            try:
                categoria = Categories(name_categories=nombre_categoria)
                categoria.save()
            except Exception as e:
                return JsonResponse({'ok': False, 'error': 'La categoría ya existe'}, status=400)

            return JsonResponse({'ok': True})
        else:
            return JsonResponse({'ok': False, 'error': 'El proceso de actualización falló'}, status=400)

    return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)


def deleteCategories(request, id):

    if request.method == 'DELETE':
        try:
            categoria = Categories.objects.get(pk=id)
            categoria.delete()
            return JsonResponse({'ok': True})
        except Exception as e:
            return JsonResponse({'ok': False, 'error': 'El proceso de eliminación falló'}, status=400)

    return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)


#Endpoints de la API de productos
def getProducts(request):
    if request.method == 'GET':
        
        # products = list(Product.objects.values('id', 'Product', 'category__', 'description', 'price', 'image'))
        #Consultamos los productos y el nombre de la categoria a la que pertenece
        products = list(Product.objects.values('id', 'Product', 'category__name_categories', 'description', 'price', 'image'))
        data = {
            'products': products
        }

        return JsonResponse(data)

def createProducts(request):
    
        if request.method == 'POST':
            nombre_producto = request.POST.get('nombre_producto')
            categoria_producto = request.POST.get('categoria_producto')
            descripcion_producto = request.POST.get('descripcion')
            precio_producto = request.POST.get('precio')
            imagen_producto = request.FILES.get('imagen')  # Usa request.FILES para obtener el archivo
    
            if nombre_producto and categoria_producto and descripcion_producto and precio_producto and imagen_producto:
                try:
                    producto = Product(
                        Product=nombre_producto,
                        category_id=categoria_producto,
                        description=descripcion_producto,
                        price=precio_producto,
                        image=imagen_producto
                    )
                    producto.save()
                except Exception as e:
                    return JsonResponse({'ok': False, 'error': 'El producto ya existe'}, status=400)
    
                return JsonResponse({'ok': True})
            else:
                return JsonResponse({'ok': False, 'error': 'El proceso de creación falló'}, status=400)
    
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)


def deleteProducts(request, id):
    
        if request.method == 'DELETE':
            try:
                producto = Product.objects.get(pk=id)
                producto.delete()
                return JsonResponse({'ok': True})
            except Exception as e:
                return JsonResponse({'ok': False, 'error': 'El proceso de eliminación falló'}, status=400)
    
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)


def updateProducts(request, id):
        
            producto = Product.objects.get(pk=id)
        
            if request.method == 'POST':
                nuevo_nombre = request.POST.get('nombre_producto')
                nueva_categoria = request.POST.get('categoria_producto')
                nueva_descripcion = request.POST.get('descripcion')
                nuevo_precio = request.POST.get('precio')
                nueva_imagen = request.FILES.get('imagen')  # Usa request.FILES para obtener el archivo
        
                if nuevo_nombre and nueva_categoria and nueva_descripcion and nuevo_precio and nueva_imagen:
                    producto.Product = nuevo_nombre
                    producto.category_id = nueva_categoria
                    producto.description = nueva_descripcion
                    producto.price = nuevo_precio
                    producto.image = nueva_imagen
        
                    producto.save()
        
                    return JsonResponse({'ok': True})
                else:
                    return JsonResponse({'ok': False, 'error': 'El proceso de actualización falló'}, status=400)
        
            return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)