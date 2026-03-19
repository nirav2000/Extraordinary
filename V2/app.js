fetch('data.json')
.then(r=>r.json())
.then(data=>{
  const cards = document.getElementById('cards');
  const search = document.getElementById('search');

  function render(list){
    cards.innerHTML='';
    list.forEach(p=>{
      const div=document.createElement('div');
      div.className='card';
      div.innerHTML=`
        <img src="${p.image}">
        <div class="content">
          <h3>${p.name}</h3>
          <div class="tag">${p.category}</div>
          <div class="why">${p.why}</div>
        </div>
      `;
      cards.appendChild(div);
    });
  }

  render(data);

  search.addEventListener('input', e=>{
    const q=e.target.value.toLowerCase();
    render(data.filter(p=>p.name.toLowerCase().includes(q)));
  });
});