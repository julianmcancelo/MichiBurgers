# 🍔 MichiBurgers - Sistema de Gestión de Restaurante

**Proyecto de Julián Cancelo - Estudiante de Analista de Sistemas**

Una aplicación web completa para manejar todas las operaciones de un restaurante: desde tomar pedidos y controlar mesas hasta administrar productos y gestionar la cocina.

## 🎯 ¿De qué se trata?

MichiBurgers es un sistema que digitaliza la operación de un restaurante. Permite:

- **Gestionar mesas**: Ver qué mesas están libres, ocupadas o necesitan limpieza
- **Tomar pedidos**: Los mozos pueden cargar pedidos desde cualquier dispositivo
- **Controlar la cocina**: Los cocineros ven los pedidos en tiempo real
- **Administrar productos**: Agregar, editar o quitar productos del menú
- **Generar códigos QR**: Para que los clientes puedan ver el menú desde su celular
- **Control de usuarios**: Diferentes permisos para admin, mozos, cocina y caja

## 💻 Tecnologías Usadas

**Frontend:**
- Angular 20 - Para la interfaz de usuario
- TypeScript - Lenguaje de programación
- Tailwind CSS - Para los estilos
- Angular Material - Componentes de diseño

**Backend:**
- PHP - Para el servidor
- MySQL - Base de datos
- JWT - Para el login seguro

**Herramientas:**
- Git - Control de versiones
- ESLint y Prettier - Para mantener el código limpio
- Vite - Para compilar la aplicación

## 🔧 Cómo instalarlo

**Necesitas tener instalado:**
- Node.js (versión 18 o superior)
- PHP (versión 8 o superior)
- MySQL
- Git

**Pasos:**

1. **Descargar el proyecto**
```bash
git clone https://github.com/julianmcancelo/MichiBurgers.git
cd MichiBurgers
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la base de datos**
- Crear una base de datos MySQL llamada `michiburgers`
- Configurar las credenciales en `api/.env`

4. **Ejecutar la aplicación**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 📱 Funcionalidades

**Para Administradores:**
- Crear, editar y eliminar productos
- Generar códigos QR para las mesas
- Ver reportes y estadísticas
- Gestionar usuarios del sistema

**Para Mozos:**
- Ver el estado de todas las mesas
- Tomar pedidos de los clientes
- Enviar pedidos a la cocina
- Marcar mesas como ocupadas o libres

**Para Cocina:**
- Recibir pedidos en tiempo real
- Marcar pedidos como "preparando" o "listos"
- Ver la cola de pedidos pendientes

**Para Clientes:**
- Escanear código QR para ver el menú
- Hacer pedidos desde el celular
- Ver precios actualizados

## 👨‍💻 Sobre el Desarrollador

**Julián M. Cancelo**
- Estudiante de Analista de Sistemas
- Apasionado por el desarrollo web y la tecnología
- Este proyecto representa mi aprendizaje en desarrollo full-stack

**Contacto:**
- GitHub: [@julianmcancelo](https://github.com/julianmcancelo)
- Proyecto: [MichiBurgers](https://github.com/julianmcancelo/MichiBurgers)

## 🎯 Objetivos del Proyecto

Este sistema fue desarrollado como proyecto académico para demostrar:
- Conocimientos en desarrollo web moderno
- Capacidad de crear aplicaciones full-stack
- Comprensión de bases de datos y APIs
- Habilidades en análisis de sistemas
- Aplicación de buenas prácticas de programación

## 🚀 Próximas Mejoras

**Funcionalidades que me gustaría agregar:**
- Sistema de facturación automática
- Integración con métodos de pago (MercadoPago, etc.)
- Reportes de ventas más detallados
- Notificaciones push para celulares
- App móvil nativa

**Mejoras técnicas:**
- Agregar tests automatizados
- Implementar cache para mejor rendimiento
- Optimizar la base de datos
- Agregar logs del sistema
- Configurar deployment automático

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos como parte de mi formación en Analista de Sistemas. El código está disponible para consulta y aprendizaje.

---

**Desarrollado con ❤️ por Julián Cancelo**  
*Estudiante de Analista de Sistemas*

