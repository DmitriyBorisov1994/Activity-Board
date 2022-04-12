async function getBoardData(url = 'data/data.json') {
   const response = await fetch(url);
   const data = await response.json();
   return data;
}

class BoardItem {
   static periods = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month'
   }
   constructor(data, container = '.board__content', view = 'weekly') {
      this.data = data;
      this.container = document.querySelector(container);
      this.view = view;
      this._createMarkup();
   }
   _createMarkup() {
      const { title, timeframes } = this.data;
      const id = title.toLowerCase().split(' ').join('');
      const { current, previous } = timeframes[this.view.toLowerCase()];
      this.container.insertAdjacentHTML('beforeend',
         `<div class="board__item board__item--${id}">
            <article class="card-tracking">
               <header class="card-tracking__header">
                  <h4 class="card-tracking__title">${title}</h4>
                  <img class="card-tracking__menubtn" src="images/icon-ellipsis.svg" alt="menu">
               </header>
               <div class="card-tracking__body">
                  <div class="card-tracking__time">${current}hrs</div>
                  <div class="card-tracking__prev">
                     Last ${BoardItem.periods[this.view]} - ${previous}hrs
                  </div>
               </div>
            </article>
         </div>`)
      this.time = this.container.querySelector(`.board__item--${id} .card-tracking__time`);
      this.prev = this.container.querySelector(`.board__item--${id} .card-tracking__prev`);
   }
   changeView(view) {
      this.view = view.toLowerCase();
      const { current, previous } = this.data.timeframes[this.view.toLowerCase()];
      this.time.innerText = `${current}hrs`;
      this.prev.innerText = `Last ${BoardItem.periods[this.view]} - ${previous}hrs`;
   }
}
document.addEventListener('DOMContentLoaded', () => {
   getBoardData()
      .then(data => {
         const activities = data.map(activity => new BoardItem(activity));
         const selectors = document.querySelectorAll('.card-select__item');
         selectors.forEach(selector => selector.addEventListener('click', () => {
            selectors.forEach(sel => sel.classList.remove('card-select__item--active'));
            selector.classList.add('card-select__item--active');
            const currentView = selector.innerText.trim().toLowerCase();
            activities.forEach(activity => activity.changeView(currentView))
         }))
      })
})