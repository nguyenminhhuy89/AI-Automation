interface Products {
  name: string;
  url: string;
  id?: number;
}

export const PRODUCTS: Record<string, Products> = {
  book1: {
    name: 'Computing and Internet',
    url: 'https://demowebshop.tricentis.com/computing-and-internet',
    id: 53
  },
  book2: {
    name: 'Fiction',
    url: 'https://demowebshop.tricentis.com/fiction',
    id: 45
  },
  book3: {
    name: 'Health Book',
    url: 'https://demowebshop.tricentis.com/health',

  },
  book4: {
    name: 'Science',
    url: 'https://demowebshop.tricentis.com/science',

  },
  Electronics1: {
    name: 'Camcorder',
    url: 'https://demowebshop.tricentis.com/camcorder',
  },
  Electronics2: {
    name: 'High Definition 3D Camcorder',
    url: 'https://demowebshop.tricentis.com/3d-camcorder',
  },
  Computer1:{
    name: 'Build your own cheap computer',
    url: 'https://demowebshop.tricentis.com/build-your-cheap-own-computer'
  },
  Computer2:{
    name: 'Build your own computer',
    url: 'https://demowebshop.tricentis.com/build-your-own-computer'
  },
  Computer3:{
    name: 'Build your own expensive computer',
    url: 'https://demowebshop.tricentis.com/build-your-own-expensive-computer-2'
  },
  Laptop:{
    name:'14.1-inch Laptop',
    url:'https://demowebshop.tricentis.com/141-inch-laptop'
  }


};
 