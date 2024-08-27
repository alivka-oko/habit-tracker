'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY'
let globalActiveHabbitId;
/* page */

const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        header: document.querySelector('.header'),
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
        daysContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habbit__day')
    },
}

/* utils */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits))
}

/* render */

function rerenderMenu(activeHabbit) {

    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu__item');
            element.addEventListener('click', () => rerender(habbit.id))
            element.innerHTML = `<img src="images/${habbit.icon}.svg" alt="${habbit.name}">`

            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu__item-active')
            }

            page.menu.appendChild(element)
            continue;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu__item-active')
        } else {
            existed.classList.remove('menu__item-active')
        }
    }
}

function rerenderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name

    const progress = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100

    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.style.width = progress.toFixed(0) + '%';
}

function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
    for (const dayIndex in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `
                        <div class="habbit__day">День ${Number(dayIndex) + 1}</div>
                        <div class="habbit__comment">${activeHabbit.days[dayIndex].comment}</div>
                        <button class="habbit__delete" onclick="deleteDay(${Number(dayIndex)})">
                            <img src="images/delete.svg" alt="Удалить день ${Number(dayIndex) + 1}">
                        </button>`;
        page.content.daysContainer.appendChild(element)
    }
    page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbits => habbits.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    page.header.header.setAttribute('habbit-id', activeHabbit.id)
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
    event.preventDefault();
    const form = event.target
    const data = new FormData(event.target);
    const comment = data.get('comment');
    form['comment'].classList.remove('error');
    if (!comment) {
        form['comment'].classList.add('error');
        return;
    }
    // const activeHabbit = habbits.find(habbits => habbits.id === globalActiveHabbitId);
    // activeHabbit.days.push({ comment })

    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment }])
            }
        }
        return habbit;
    });
    form['comment'].value = ''
    rerender(Number(globalActiveHabbitId))
    saveData()

}

function deleteDay(index) {
    const currentDays = habbits.find(habbit => habbit.id === globalActiveHabbitId).days
    currentDays.splice(index, 1)
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: currentDays
            }
        }
        return habbit;
    });
    rerender(Number(globalActiveHabbitId))
    saveData()
}

/* init */
(() => {
    loadData();
    rerender(habbits[0].id)
})()



