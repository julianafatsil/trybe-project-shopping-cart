
// Faz a comunicação com a API, recebendo por parâmetro o que vai ser consultado
const findProducts = nameProduct =>
  fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${nameProduct}`);

const load = () => {
  const divLoad = document.createElement('div');
  divLoad.className = 'loading';
  divLoad.innerText = 'loading...';
  return divLoad;
};

const sumPrice = async () => {
  try {
    const items = await document.querySelectorAll('.cart__item');
    let sumTotalItems = 0;
    items.forEach((item) => {
      let sumAux = item.innerText;
      sumAux = sumAux.split('|')[2].split('$')[1];
      sumTotalItems += parseFloat(sumAux);
    });
    document.querySelector('.total-price').innerText = sumTotalItems;
  } catch (err) {
    console.log(err);
  }
};

const SaveLocalStorage = () => {
  localStorage.setItem('cart', document.querySelector('.cart__items').innerHTML);
  localStorage.setItem('price', document.querySelector('.total-price').innerText);
};

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  // section.lastElementChild.id = sku;
  // section.lastElementChild.addEventListener('click', )

  return section;
}

function getSkuFromProductItem(item) { // Recebe o item clicado
  return item.querySelector('span.item__sku').innerText; // Retorna o id
}

function cartItemClickListener(event) {
  // pega primeira classe e remove seu filho que foi passado no event
  document.querySelector('.cart__items').removeChild(event.path[0]);
  sumPrice();
  SaveLocalStorage();
}

const findProductsCart = idProduct =>
  fetch(`https://api.mercadolibre.com/items/${idProduct}`);

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const addItemCart = (event) => { // Pega evento do click
  findProductsCart(getSkuFromProductItem(event.path[1])) // passando como parãmetro o id
    .then(response => response.json())
    .then((data) => {
      const objectProductSelected = { sku: data.id, name: data.title, salePrice: data.price };
      // createProductItemElement recebe objeto, o mesmo é criado como filho do items
      const itemSelectedCart = document.querySelector('.cart__items');
      // Adiciona produto no carrinho
      itemSelectedCart.appendChild(createCartItemElement(objectProductSelected));
      sumPrice();
      SaveLocalStorage();
    });
};
// Arrow function, que retorna todos os items da API, como filhos da classe ITEMS
const Onload = () => {
  const items = document.querySelector('.items'); // Pegando a primeira classe que ele encontra .items
  const divLoad = load();
  // Recebe a criação da load, para add e depois excluir após items já serem carregados
  items.appendChild(divLoad); // Adicionando a divLoad, como um filho do items

  items.addEventListener('click', addItemCart); // Pega item clicado, e chama a função

  findProducts('computador') // passando o 'computador' por parametro para a função
    .then(response => response.json()) // Primeiro espera a resposta do findProducts
    .then((data) => { // Espera vim a resposat do them acima
      if (data.results.length > 0) { // Se resposta do then, vem com items
        data.results.forEach((item) => { // Pega alguns dados do que veio da api {}
          const objectProduct = { sku: item.id, name: item.title, image: item.thumbnail };
          // CreateProductItemElement recebe objeto, o mesmo é criado como filho do items
          items.appendChild(createProductItemElement(objectProduct));
        });
        // remove a div load, pois ja foi carregado todos os items
        items.removeChild(divLoad);
      } else {
        items.innerHTML = 'Esta informação veio sem registros!!';
      }
    })
    .catch((err) => {
      items.innerHTML = `Oops! ${err}`;
    });
};

const removeAll = () => {
  const buttonRemoveAll = document.createElement('button');
  buttonRemoveAll.innerText = 'Esvaziar carrinho';
  buttonRemoveAll.className = 'empty-cart';
  buttonRemoveAll.addEventListener('click', () => {
    document.querySelector('.cart__items').innerHTML = '';
    sumPrice();
    localStorage.removeItem('cart');
    localStorage.removeItem('price');
  });

  document.querySelector('.cart').appendChild(buttonRemoveAll);
};

const CreateSumPrice = () => {
  const divSumPrice = document.createElement('div');
  divSumPrice.innerText = '0.00';
  divSumPrice.className = 'total-price';
  document.querySelector('.cart').appendChild(divSumPrice);
};

const LoadStorage = () => {
  if (localStorage.getItem('cart')) {
    const divItems = document.querySelector('.cart__items');
    divItems.innerHTML = localStorage.getItem('cart');
    for (let index = 0; index < divItems.childElementCount; index += 1) {
      divItems.children[index].addEventListener('click', cartItemClickListener);
    }
  }
  document.querySelector('.total-price').innerText =  // se cont exibe cont, se não ''
    (localStorage.getItem('price') ? localStorage.getItem('price') : '0.00');
};

window.onload = function onload() {
  Onload();
  CreateSumPrice();
  removeAll();
  LoadStorage();
};
