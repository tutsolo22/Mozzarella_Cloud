import { Step } from 'react-joyride';

export const onboardingSteps: Step[] = [
  {
    target: '[data-tour="menu-settings"]',
    content: '¡Bienvenido a Mozzarella Cloud! Empecemos por configurar la información de tu negocio. Aquí podrás personalizar desde el nombre y logo hasta tus redes sociales.',
    placement: 'right',
    title: '1. Configuración del Negocio',
  },
  {
    target: '[data-tour="menu-locations"]',
    content: 'El siguiente paso es revisar tus sucursales. Puedes editar la "Sucursal Principal" que creamos para ti o añadir nuevas ubicaciones.',
    placement: 'right',
    title: '2. Gestión de Sucursales',
  },
  {
    target: '[data-tour="menu-hr"]',
    content: 'Ahora, gestionemos a tu equipo. En esta sección podrás definir los puestos de trabajo y dar de alta a tus empleados, creando accesos al sistema si es necesario.',
    placement: 'right',
    title: '3. Recursos Humanos',
  },
  {
    target: '[data-tour="menu-product-categories"]',
    content: '¡Es hora de construir tu menú! Primero, organiza tus productos creando categorías como "Pizzas", "Bebidas" o "Postres".',
    placement: 'right',
    title: '4. Categorías de Productos',
  },
  {
    target: '[data-tour="menu-products"]',
    content: 'Con las categorías listas, ya puedes crear tus productos. Aquí añadirás nombres, precios y la información fiscal que acabamos de implementar.',
    placement: 'right',
    title: '5. Creación de Productos',
  },
  {
    target: '[data-tour="menu-products"]',
    content: 'Para un control de inventario preciso, no olvides asignar una receta a cada producto. Busca el botón "Receta" en la lista de productos.',
    placement: 'right',
    title: '6. Asignación de Recetas',
  },
  {
    target: 'body',
    content: '¡Has completado los primeros pasos! Ya estás listo para explorar el resto de funcionalidades. Si necesitas ayuda, busca el botón del tour en la cabecera.',
    placement: 'center',
    title: '¡Todo Listo!',
  },
];