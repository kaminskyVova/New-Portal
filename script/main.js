const choicesElem = document.querySelector('.js-choice');
const API_KEY = '82ec84749c5d472e80d941d6b205e0d5';

const newsList = document.querySelector('.news-list');
const formSearch = document.querySelector('.form-search');
const title = document.querySelector('.title');

const choices = new Choices(choicesElem, {
  searchEnabled: false,
  itemSelectText: '',
});

const getDateCorrectFormate = (isoDate) => {
  const date = new Date(isoDate);
  const fullDate = date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const fullTime = date.toLocaleString('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
  });

  return `<span class="news-date">${fullDate}</span>${fullTime}`;
};

const getImage = (url) =>
  new Promise((resolve) => {
    const image = new Image(270, 200);
    image.addEventListener('load', () => {
      resolve(image);
    });

    image.addEventListener('error', () => {
      image.src = 'image/no-photo.jpg';
      resolve(image);
    });
    image.src = url || 'image/no-photo.jpg';
    image.className = 'news-image';

    return image;
  });

export const renderNewsCard = (data) => {
  newsList.textContent = '';

  data.forEach(
    async ({ urlToImage, title, url, description, publishedAt, author }) => {
      const card = document.createElement('li');
      card.classList.add('news-item');

      const image = await getImage(urlToImage);
      image.alt = title;

      card.append(image);

      card.insertAdjacentHTML(
        'beforeend',
        `
      <h3 class="news-title">
			<a href="${url}" class="news-link" target="_blank">${title || 'Not Added'}</a>
			</h3>
			<p class="news-description">${description || 'Not Added'}...</p>
			<div class="news-footer">
				<time class="news-datetime" datetime="${publishedAt}">
						${getDateCorrectFormate(publishedAt)}
					</time>
				<p class="news-author">${author || 'Not Added'}</p>
			</div>
					`
      );

      newsList.append(card);
    }
  );
};

const getDataNews = async (url) => {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    },
  });

  const data = await response.json();

  return data;
};

const getDataBySearch = async (url) => {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    },
  });

  const data = await response.json();

  return data;
};

export const loadNews = async (country) => {
  newsList.innerHTML = '<li class="preload"></li>';

  if (!country) {
    country = 'ru';
    title.classList.remove('hide');
    title.textContent = `Страна запроса: “Россия”`;
  }

  choices.setChoiceByValue(country);
  choicesElem.addEventListener('change', (e) => {
    title.classList.remove('hide');
    title.textContent = `Страна запроса: “${e.target.textContent}”`;
  });
  const data = await getDataNews(
    `https://newsapi.org/v2/top-headlines?country=${country}`
  );
  renderNewsCard(data.articles);
};

export const loadSearchNews = async (value) => {
  const data = await getDataBySearch(
    `https://newsapi.org/v2/everything?q=${value}`
  );
  title.classList.remove('hide');
  title.textContent = `По вашему запросу “${value}” найдено ${data.articles.length} результатов`;
  choices.setChoiceByValue('');
  renderNewsCard(data.articles);
};

Promise.all([
  new Promise(() => {
    choicesElem.addEventListener('change', (e) => {
      const value = e.detail.value;
      loadNews(value);
    });
  }),

  new Promise(() => {
    formSearch.addEventListener('submit', (e) => {
      e.preventDefault();
    
      loadSearchNews(formSearch.search.value);
      formSearch.reset();
    });
  })
]);



loadNews();
