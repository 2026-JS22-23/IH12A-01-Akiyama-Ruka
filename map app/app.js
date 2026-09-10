const spots = [
  {
    id: "aikawa",
    title: "相生山緑地（オアシスの森）",
    category: "自然",
    tags: ["散歩", "森林", "景色"],
    address: "愛知県名古屋市天白区天白町大字野並",
    description: "名古屋市内とは思えないほど豊かな自然が残る緑地です。四季折々の景色が楽しめ、静かな散歩に最適なスポットです。地元の人にも人気の癒しスポットとして親しまれています。",
    lat: 35.110896,
    lng: 136.969761,
    image: "./images/aikawa.jpg",
    thumb: "./images/aikawa.jpg"
  },
  {
    id: "tenpaku_park",
    title: "天白公園",
    category: "公園",
    tags: ["家族", "ピクニック", "自然"],
    address: "愛知県名古屋市天白区天白町大字島田字黒石",
    description: "広い敷地と池、緑の木々が広がる天白公園は、家族連れやカップルに人気です。ベンチや遊具があり、ゆったりとした時間を過ごせる名所です。",
    lat: 35.117239,
    lng: 136.986912,
    image: "./images/tenpaku-park.jpg",
    thumb: "./images/tenpaku-park.jpg"
  },
  {
    id: "raamen_sora",
    title: "らぁ麵 蒼空",
    category: "グルメ",
    tags: ["ラーメン", "夜食", "人気店"],
    address: "愛知県名古屋市天白区井口1-2012",
    description: "私のバイト先です。天白区で気軽に立ち寄れるらぁ麵店。こってり系からあっさり系まで、ランチや夜の食事にぴったりな一杯が楽しめます。地元の人にも愛される定番のお店です。",
    lat: 35.12597,
    lng: 136.992659,
    image: "./images/raamen-sora.jpg",
    thumb: "./images/raamen-sora.jpg"
  },
  {
    id: "tempaku_cafe",
    title: "原駅周辺の飲み屋エリア",
    category: "飲み屋",
    tags: ["バー", "居酒屋", "夜の散歩"],
    address: "愛知県名古屋市天白区原1丁目（原駅周辺）",
    description: "天白区の原駅周辺には落ち着いた飲み屋やバーが点在し、地元の雰囲気を感じながらゆったりとした夜を楽しめます。仕事帰りや友人との時間におすすめです。",
    lat: 35.126011,
    lng: 136.997003,
    image: "./images/cafe.jpg",
    thumb: "./images/cafe.jpg"
  },
  {
    id: "local_walk",
    title: "天白川沿い散策コース",
    category: "町歩き",
    tags: ["散策", "街歩き", "体験"],
    address: "愛知県名古屋市天白区植田南（天白川緑地周辺）",
    description: "天白川沿いの緑地や周辺を歩きながら、地域の暮らしや自然に触れることができます。日常の景色を感じられる、自然と都市が調和したおすすめ散策コースです。",
    lat: 35.126619,
    lng: 136.984467,
    image: "./images/river-walk.jpg",
    thumb: "./images/river-walk.jpg"
  }
];

const pageType = document.body.dataset.page || "home";
let map;
let infoWindow;
let markers = [];
let currentMapCenter = null;

function getSpotById(id) {
  return spots.find((spot) => spot.id === id);
}

function createMarkerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
      <path d="M26 2C15.51 2 7 10.51 7 21c0 16.16 19 29 19 29s19-12.84 19-29C45 10.51 36.49 2 26 2z" fill="#2B6A4B"/>
      <circle cx="26" cy="21" r="9" fill="#F7F3E7"/>
      <path d="M26 8a13 13 0 0 1 13 13c0 9.86-13 20-13 20S13 30.86 13 21A13 13 0 0 1 26 8z" fill="none" stroke="#DDEAD9" stroke-width="2"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(42, 42),
    anchor: new google.maps.Point(21, 42)
  };
}

function createInfoWindowContent(spot) {
  return `
    <div class="info-window">
      <img src="${spot.image}" alt="${spot.title}" />
      <h3>${spot.title}</h3>
      <p><strong>住所:</strong> ${spot.address}</p>
      <p style="margin-top: 4px;">${spot.description}</p>
    </div>
  `;
}

function renderSpotCards(filterText = "") {
  const list = document.getElementById("spotList");
  if (!list) return;

  const filtered = spots.filter((spot) => {
    const query = filterText.trim().toLowerCase();
    if (!query) return true;

    return (
      spot.title.toLowerCase().includes(query) ||
      spot.category.toLowerCase().includes(query) ||
      spot.address.toLowerCase().includes(query) ||
      spot.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">該当するスポットはありません。</div>';
    return;
  }

  list.innerHTML = filtered
    .map(
      (spot) => `
        <article class="spot-card" data-id="${spot.id}">
          <div class="spot-thumb" style="background-image: url('${spot.thumb}')"></div>
          <div class="spot-info">
            <h4>${spot.title}</h4>
            <p>${spot.description.slice(0, 70)}...</p>
            <div class="spot-meta">
              ${spot.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");

  list.querySelectorAll(".spot-card").forEach((card) => {
    card.addEventListener("click", () => {
      const selected = card.dataset.id;
      window.location.href = `./detail.html?id=${selected}`;
    });
  });
}

function renderMapSpotList() {
  const list = document.getElementById("mapSpotList");
  if (!list) return;

  list.innerHTML = spots
    .map(
      (spot) => `
        <button class="map-spot-item" data-id="${spot.id}">
          <img src="${spot.thumb}" alt="${spot.title}" />
          <div>
            <strong>${spot.title}</strong>
            <span>${spot.category} | ${spot.address.replace("愛知県名古屋市天白区", "")}</span>
          </div>
        </button>
      `
    )
    .join("");

  list.querySelectorAll(".map-spot-item").forEach((button) => {
    button.addEventListener("click", () => {
      const spot = getSpotById(button.dataset.id);
      if (!spot || !map) return;

      const position = { lat: spot.lat, lng: spot.lng };
      map.setCenter(position);
      map.setZoom(15);

      const targetMarker = markers.find((marker) => marker.title === spot.title);
      if (targetMarker) {
        infoWindow.setContent(createInfoWindowContent(spot));
        infoWindow.open({
          map,
          anchor: targetMarker
        });
      }
    });
  });
}

function renderDetailPage() {
  const id = new URLSearchParams(window.location.search).get("id");
  const spot = getSpotById(id);

  if (!spot) {
    document.getElementById("detailTitle").textContent = "スポットが見つかりませんでした";
    return;
  }

  const hero = document.getElementById("detailHero");
  const title = document.getElementById("detailTitle");
  const meta = document.getElementById("detailMeta");
  const description = document.getElementById("detailDescription");

  hero.style.backgroundImage = `url('${spot.image}')`;
  title.textContent = spot.title;
  meta.innerHTML = `
    <span class="tag">${spot.category}</span>
    ${spot.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    <span class="tag">${spot.address}</span>
  `;
  description.textContent = spot.description;

  currentMapCenter = { lat: spot.lat, lng: spot.lng };
}

function initMap() {
  const mapTarget = document.getElementById("map");
  const detailMapTarget = document.getElementById("detailMap");

  if (pageType === "map" && mapTarget) {
    // 天白区中心付近に初期表示を中心化
    const defaultCenter = { lat: 35.121, lng: 136.985 };

    map = new google.maps.Map(mapTarget, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    infoWindow = new google.maps.InfoWindow();

    spots.forEach((spot) => {
      const marker = new google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map,
        title: spot.title,
        icon: createMarkerIcon()
      });

      marker.addListener("click", () => {
        infoWindow.setContent(createInfoWindowContent(spot));
        infoWindow.open({
          anchor: marker,
          map
        });
      });

      markers.push(marker);
    });

    renderMapSpotList();
  }

  if (pageType === "detail" && detailMapTarget) {
    const spotId = new URLSearchParams(window.location.search).get("id");
    const spot = getSpotById(spotId);

    if (!spot) return;

    map = new google.maps.Map(detailMapTarget, {
      center: { lat: spot.lat, lng: spot.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map,
      title: spot.title,
      icon: createMarkerIcon()
    });

    const info = new google.maps.InfoWindow({
      content: createInfoWindowContent(spot)
    });

    marker.addListener("click", () => {
      info.open({
        anchor: marker,
        map
      });
    });

    info.open({
      anchor: marker,
      map
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (pageType === "home") {
    renderSpotCards();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        renderSpotCards(event.target.value);
      });
    }

    $("#accordion").accordion({
      heightStyle: "content"
    });
  }

  if (pageType === "detail") {
    renderDetailPage();
  }

  if (pageType === "map") {
    renderMapSpotList();
  }
});