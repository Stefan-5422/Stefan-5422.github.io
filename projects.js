const reporoot = document.getElementById('reporoot')
const modal = document.getElementById('modal')
const modalcontent = document.getElementById('modal-content')

Element.prototype.addChild = function (
  type,
  text = '',
  c_class = '',
  params = {},
) {
  //This is using non arrow functions because of weird "this" behaviour

  let elem = document.createElement(type)
  elem.innerText = text
  elem.className = c_class

  for (const key of Object.keys(params)) {
    const val = params[key]
    elem.setAttribute(key, val)
  }

  this.appendChild(elem)
  return elem
}

modal.onclick = () => {
  modal.style.display = 'none'
}

const updatemodal = (el) => {
  modalcontent.innerHTML = ''
  modalcontent
    .addChild('a', '', '', {
      href: 'https://github.com/' + el.full_name,
    })
    .addChild('h1', el.name, 'hoverlight')
  modalcontent.addChild('p', el.description)
  modal.style.display = 'block'
}

const getdata = async () => {
  const data = await fetch(
    'https://api.github.com/users/stefan-5422/repos',
  ).then((response) => response.json())

  data.forEach((el) => {
    reporoot
      .addChild('div', '', 'hoverlight')
      .addChild('p', el.name, '').onclick = () => updatemodal(el)
  })
}
getdata()
