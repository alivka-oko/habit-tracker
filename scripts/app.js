'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY'
let globalActiveHabbitId;
const demoData = [
    {
        "id": 1,
        "icon": "sport",
        "name": "Первая привычка",
        "target": 5,
        "days": [
            {
                "comment": "Здесь можно добавлять комментарии!"
            }
        ]
    }
]
/* page */

const page = {
    menu: {
        list: document.querySelector('.menu__list')
    },
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
    popup: {
        window: document.querySelector('.cover'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    }
}

/* utils */


function loadData() {

    if (localStorage.getItem(HABBIT_KEY) === null) {
        localStorage.setItem(HABBIT_KEY, JSON.stringify(demoData))
    }

    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits))
}


function togglePopup() {
    page.popup.window.classList.toggle('cover-hidden')
}

function getLastHabbitId() {
    const habbitsArray = [...habbits]
    return habbitsArray.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    let isValid = true;
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error')
        }
        res[field] = fieldValue;

        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = ''
    }
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

            page.menu.list.appendChild(element)
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
    page.header.header.setAttribute('habbit-id', activeHabbit.id);
    document.location.replace(document.location.pathname + '#' + activeHabbitId)
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
    event.preventDefault();

    const data = validateAndGetFormData(event.target, ['comment'])
    if (!data) {
        return
    }

    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            }
        }
        return habbit;
    });
    resetForm(event.target, ['comment'])
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


/* working with habbits */
function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon-active')
    activeIcon.classList.remove('icon-active')
    context.classList.add('icon-active')
    console.log()
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'target', 'icon']);
    if (!data) {
        return;
    }

    const habbit = {
        id: getLastHabbitId() + 1,
        icon: data.icon,
        name: data.name,
        target: data.target,
        days: []
    }

    habbits.push(habbit)
    globalActiveHabbitId = habbit.id

    resetForm(event.target, ['name', 'target'])
    togglePopup();
    saveData();
    rerender(globalActiveHabbitId);
}



/* init */
(() => {
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''))
    const urlHabbit = habbits.find(habbit => habbit.id === hashId);
    if (urlHabbit) {
        rerender(urlHabbit.id)
    } else {
        rerender(habbits[0].id)
    }
})()



