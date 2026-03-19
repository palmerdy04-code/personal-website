import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

function formatTitle(title) {
  const words = title.split(" ");
  if (words.length < 4) {
    return title;
  }

  const pivot = Math.max(1, Math.floor(words.length / 2) - 1);
  return html`${words.slice(0, pivot).join(" ")} <span className="text-pop">${words.slice(pivot, pivot + 2).join(" ")}</span> ${words.slice(pivot + 2).join(" ")}`;
}

function formatMiles(value) {
  return `${Number(value ?? 0).toFixed(1)} mi`;
}

function formatHours(value) {
  return `${Number(value ?? 0).toFixed(1)} hrs`;
}

function formatFeet(value) {
  return `${Math.round(Number(value ?? 0)).toLocaleString()} ft`;
}

function formatElapsedTime(seconds) {
  if (seconds == null) {
    return "Not yet";
  }

  const totalSeconds = Number(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatCalendarDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatWeekLabel(value) {
  if (!value) {
    return "This week";
  }

  const start = new Date(`${value}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

const manualPrs = [
  { label: "1/4 mile", time: "1:05", note: "Current personal best" },
  { label: "1/2 mile", time: "2:20", note: "Current personal best" },
  { label: "1 mile", time: "5:35", note: "Current personal best" },
  { label: "2 mile", time: "11:10", note: "Current personal best" },
  { label: "5k", time: "19:40", note: "Current personal best" },
  { label: "10k", time: "39:50", note: "Current personal best" },
  { label: "Half marathon", time: "1:32:00", note: "Current personal best" },
  { label: "Marathon", time: "Not attempted", note: "Still on the horizon" },
];

const travelLocations = [
  {
    title: "London, England",
    type: "Major trip",
    summary: "A city trip shaped by old architecture, constant movement, and the kind of visit that feels personal because it was built around seeing a friend.",
    details: "London stands out as one of those places where every neighborhood seems to carry its own rhythm. Visiting a friend there made the trip feel more grounded than a typical sightseeing stop, so the city comes through as both memorable and lived-in instead of just iconic.",
    photos: [
      "./photos/travel/london1.jpeg",
      "./photos/travel/london2.jpeg",
      "./photos/travel/london3.jpeg",
      "./photos/travel/ondon4.jpeg",
      "./photos/travel/london5.jpeg",
      "./photos/travel/london6.jpeg",
    ],
  },
  {
    title: "Barcelona, Spain",
    type: "Major trip",
    summary: "A bright, high-energy stop tied to a soccer trip, with the kind of atmosphere that makes the city feel active from the moment you arrive.",
    details: "Spain carries a different kind of travel memory because the trip had its own purpose and momentum. Between the soccer connection, the architecture, and the street-level energy, Barcelona feels less like a passive vacation and more like a place experienced in motion.",
    photos: [
      "./photos/travel/spain1.JPG",
      "./photos/travel/spain2.JPG",
      "./photos/travel/spain3.JPG",
      "./photos/travel/spain4.JPG",
      "./photos/travel/spain5.JPG",
      "./photos/travel/spain6.JPG",
      "./photos/travel/spain7.JPG",
      "./photos/travel/spain8.jpg",
      "./photos/travel/spain9.JPG",
      "./photos/travel/spain10.JPG",
    ],
  },
  {
    title: "Syracuse, New York",
    type: "Place I lived",
    summary: "A foundational chapter where undergraduate life, friendships, and the first real academic momentum all came together.",
    details: "Syracuse matters because it holds your undergraduate years, which gives it a different weight than a travel destination. It is tied to routines, growth, campus life, and the stretch of time where a lot of your future direction started to take shape.",
    photos: [
      "./photos/travel/syr1.jpeg",
      "./photos/travel/syr2.JPG",
      "./photos/travel/syr3.jpeg",
      "./photos/travel/syr4.jpeg",
      "./photos/travel/syr5.jpeg",
      "./photos/travel/syr6.jpg",
      "./photos/travel/syr7.jpeg",
      "./photos/travel/syr8.JPG",
      "./photos/travel/syr9.JPG",
    ],
  },
  {
    title: "Binghamton, New York",
    type: "Place I lived",
    summary: "Home in the deepest sense, tied to growing up, family routines, and the place everything else branches outward from.",
    details: "Binghamton is not just another point on the map. It is where you grew up, which gives it the kind of meaning built from repetition, familiarity, and history. It represents the grounding place behind the later moves, trips, and chapters that came after it.",
    photos: [
      "./photos/travel/bing1.jpeg",
      "./photos/travel/bing2.jpeg",
      "./photos/travel/ing3.jpeg",
      "./photos/travel/bing4.jpeg",
      "./photos/travel/bing5.jpeg",
      "./photos/travel/bing6.jpeg",
    ],
  },
  {
    title: "Portland, Oregon",
    type: "Major trip",
    summary: "A trip defined by atmosphere, greenery, and a distinctly different pace from the East Coast cities in my life.",
    details: "Portland stands out for the surrounding landscape as much as the city itself. It has a softer visual mood, a strong sense of place, and the kind of setting that makes even ordinary moments feel scenic.",
    photos: [
      "./photos/travel/portland1.jpeg",
      "./photos/travel/portland2.jpeg",
      "./photos/travel/portland3.jpeg",
      "./photos/travel/portland4.jpeg",
      "./photos/travel/portland5.jpeg",
      "./photos/travel/portland6.jpeg",
      "./photos/travel/portland7.jpeg",
    ],
  },
  {
    title: "Orlando, Florida",
    type: "Place I lived",
    summary: "The first real move away from home, which makes Orlando feel less like a trip and more like an early leap into independence.",
    details: "Orlando marks an important transition because it was your first move away from home. That gives the city a different kind of significance, tied to starting fresh, learning a new rhythm, and building confidence in a place that felt distinctly separate from where you grew up.",
    photos: [
      "./photos/travel/orlando1.jpeg",
      "./photos/travel/orlando2.jpeg",
      "./photos/travel/orlando3.jpeg",
      "./photos/travel/orlando4.jpeg",
      "./photos/travel/orlando5.jpeg",
      "./photos/travel/orlando6.jpeg",
      "./photos/travel/orlando7.JPG",
    ],
  },
  {
    title: "Barbados",
    type: "Major trip",
    summary: "The most obviously restorative stop in the group, built around water, warmth, and a completely different tempo.",
    details: "Barbados belongs here because it adds the kind of travel memory that feels tied to light, coastline, and being fully out of your normal routine. It is a place that reads immediately as an escape.",
    photos: [
      "./photos/travel/barbados1.jpeg",
      "./photos/travel/barbados2.jpeg",
      "./photos/travel/barbados3.jpeg",
      "./photos/travel/arbados4.jpeg",
      "./photos/travel/barbados5.jpeg",
    ],
  },
  {
    title: "Knoxville, Tennessee",
    type: "Meaningful stop",
    summary: "A place that matters because it is connected to family, which gives it a different feeling from both travel and places you have lived.",
    details: "Knoxville belongs in this section because family changes the meaning of a place. It is not just about scenery or a single trip memory. It is tied to connection, return visits, and the kind of familiarity that builds from people as much as geography.",
    photos: [
      "./photos/travel/knox1.jpeg",
      "./photos/travel/knox2.JPEG",
      "./photos/travel/knox3.JPG",
      "./photos/travel/knox4.jpeg",
    ],
  },
];

const favoriteMedia = {
  films: [
    {
      title: "The Shawshank Redemption",
      kicker: "Film",
      creator: "Frank Darabont",
      image: "./photos/media/shawshank.jpeg",
      overview:
        "Set largely inside Shawshank State Penitentiary, the film follows Andy Dufresne as he adjusts to prison life after being wrongfully convicted. Over the years he forms a deep friendship with Red, survives the cruelty of the system, and quietly builds a life of discipline, purpose, and hope in a place designed to break both.",
      resonance:
        "It resonates with me because it treats resilience as something steady and earned. The film never rushes its emotional payoff, and that patience makes the themes of hope, loyalty, and endurance feel much more powerful.",
    },
    {
      title: "Good Will Hunting",
      kicker: "Film",
      creator: "Gus Van Sant",
      image: "./photos/media/download.jpeg",
      overview:
        "The story centers on Will Hunting, a gifted young man from South Boston whose mathematical brilliance is matched by his instinct to push people away. As he is pushed toward therapy and mentorship, the film becomes less about talent itself and more about whether someone can move beyond pride, fear, and old wounds.",
      resonance:
        "I connect with it because it balances intellect with emotional honesty. It makes intelligence feel human instead of performative, and the relationships in it carry the story as much as the talent does.",
    },
    {
      title: "Top Gun: Maverick",
      kicker: "Film",
      creator: "Joseph Kosinski",
      image: "./photos/media/topgun2.jpeg",
      overview:
        "Years after the original, Maverick returns to train a new group of pilots for an extremely demanding mission that requires precision, nerve, and trust. The film mixes high-speed flight sequences with a story about age, responsibility, and learning how to lead when the stakes are personal.",
      resonance:
        "This one stands out to me because it feels exciting in a very clean, satisfying way. It has momentum, confidence, and real emotional stakes without losing the fun of watching highly capable people do difficult things well.",
    },
    {
      title: "Inglourious Basterds",
      kicker: "Film",
      creator: "Quentin Tarantino",
      image: "./photos/media/ingloriousbasterds.jpeg",
      overview:
        "Set in Nazi-occupied Europe, the film weaves together several intersecting revenge plots involving a Jewish cinema owner, a violent Allied unit, and one of cinema's most memorable villains in Hans Landa. It builds through tension-heavy conversations and sudden eruptions of violence toward a deliberately revisionist ending.",
      resonance:
        "I love how controlled it feels scene to scene. The dialogue is sharp, the tension is constant, and it has a style that makes even the quiet moments feel electric.",
    },
    {
      title: "Interstellar",
      kicker: "Film",
      creator: "Christopher Nolan",
      image: "./photos/media/interstellar.jpeg",
      overview:
        "As Earth becomes less livable, Cooper joins a mission through a wormhole in search of a new future for humanity. What starts as a space exploration story becomes a film about time, sacrifice, family, and how scientific ambition can coexist with very human emotional stakes.",
      resonance:
        "It resonates with me because it combines scientific scale with a real emotional center. I like stories that feel ambitious, and this one manages to feel huge without losing its sense of wonder or heart.",
    },
  ],
  books: [
    {
      title: "Harry Potter Series",
      kicker: "Books",
      creator: "J.K. Rowling",
      image: "./photos/media/harrypotter.jpeg",
      overview:
        "Across seven books, the series follows Harry and his friends as they grow from children discovering magic into young adults navigating danger, loyalty, and loss. What begins as an imaginative school story gradually expands into a much larger struggle over power, identity, and sacrifice.",
      resonance:
        "It stays with me because the world-building is so immersive and easy to return to. There is comfort in the setting, but also enough emotional range that rereading it still feels rewarding.",
    },
    {
      title: "The Stand",
      kicker: "Book",
      creator: "Stephen King",
      image: "./photos/media/thestand.jpeg",
      overview:
        "After a devastating pandemic wipes out most of the population, survivors are drawn into opposing camps shaped by morality, leadership, and fear. The novel moves from collapse into something larger and more mythic, blending apocalypse, character study, and confrontation between opposing visions of human nature.",
      resonance:
        "I like how immersive it is and how much weight the story gives its characters. Even with its scale, the book works because it makes the people inside it feel distinct and memorable.",
    },
    {
      title: "Fairy Tale",
      kicker: "Book",
      creator: "Stephen King",
      image: "./photos/media/fairy tale.jpeg",
      overview:
        "The novel follows Charlie Reade, a teenager whose ordinary life opens into a hidden world filled with curses, danger, and old-story logic. It blends coming-of-age emotion with fantasy adventure, gradually becoming darker and stranger as Charlie is pulled deeper into a place that needs saving.",
      resonance:
        "It resonated with me because it feels both familiar and unusual at the same time. I like the mix of classic fable energy with a darker edge and a lead character you can actually root for.",
    },
    {
      title: "The Art of War",
      kicker: "Book",
      creator: "Sun Tzu",
      image: "./photos/media/artofwar.jpeg",
      overview:
        "This is a concise work of strategy built around preparation, adaptability, deception, timing, and understanding both terrain and opponent. Though framed through warfare, its ideas are broad enough to apply to leadership, planning, and disciplined decision-making in many contexts.",
      resonance:
        "It works for me because it is so direct and durable. I appreciate writing that is compact but still useful, and this is one of those books that keeps offering something new when revisited.",
    },
    {
      title: "The Martian",
      kicker: "Book",
      creator: "Andy Weir",
      image: "./photos/media/themartian.jpeg",
      overview:
        "After being stranded on Mars, astronaut Mark Watney has to survive with limited supplies by solving one practical problem after another. The book turns engineering, improvisation, and stubborn optimism into the engine of the story, while never losing its sense of humor.",
      resonance:
        "This one really clicks with me because it makes technical problem-solving exciting. It is hard not to enjoy a story built around competence, ingenuity, and refusing to quit.",
    },
    {
      title: "Project Hail Mary",
      kicker: "Book",
      creator: "Andy Weir",
      image: "./photos/media/projecthailmary.jpeg",
      overview:
        "A lone scientist wakes up far from Earth with fragmented memories and gradually realizes he is on a mission tied to the survival of humanity. The novel blends mystery, science, humor, and discovery, building into a story that is both technically inventive and surprisingly heartfelt.",
      resonance:
        "I like how it makes science feel adventurous without losing clarity. It has the same appeal as great engineering work: difficult problems, creative thinking, and a sense of genuine discovery.",
    },
    {
      title: "The Ballad of Songbirds and Snakes",
      kicker: "Book",
      creator: "Suzanne Collins",
      image: "./photos/media/ballad of songbirds.jpeg",
      overview:
        "Set years before the original Hunger Games trilogy, the novel follows a young Coriolanus Snow as he navigates ambition, image, and power during an early version of the Games. Rather than a hero's journey, it becomes a study of how status and self-interest can harden into ideology.",
      resonance:
        "It stands out to me because it is more psychologically sharp than I expected. I like that it is willing to stay uncomfortable and explore how a person slowly becomes the worst version of himself.",
    },
    {
      title: "The Scarlet Ibis",
      kicker: "Short Story",
      creator: "James Hurst",
      image: "./photos/media/scarletibis.jpeg",
      overview:
        "This short story follows two brothers, with the narrator reflecting on pride, shame, love, and guilt in his relationship with Doodle, who is physically fragile. The story builds quietly toward a tragic ending, using its imagery and symbolism to make a relatively brief piece feel emotionally much larger.",
      resonance:
        "It resonates because it leaves such a strong impression in so little space. The emotional weight and the imagery stay with you long after the story is over.",
    },
  ],
  shows: [
    {
      title: "Westworld",
      kicker: "Show",
      creator: "Jonathan Nolan and Lisa Joy",
      image: "./photos/media/westworld.jpeg",
      overview:
        "Set in a futuristic theme park populated by lifelike hosts, the show begins as a science-fiction mystery and gradually expands into a much larger story about consciousness, free will, memory, and control. It plays with perspective and timeline in a way that keeps the audience questioning what is real and what is programmed.",
      resonance:
        "I enjoy it because it is ambitious and idea-driven. It asks big questions about identity and autonomy while still feeling stylish and immersive.",
    },
    {
      title: "Ted Lasso",
      kicker: "Show",
      creator: "Bill Lawrence, Jason Sudeikis, Brendan Hunt, and Joe Kelly",
      image: "./photos/media/tedlasso.jpeg",
      overview:
        "The series follows an American football coach hired to manage an English soccer club despite having no direct experience in the sport. What starts as a fish-out-of-water comedy becomes a show about leadership, kindness, insecurity, teamwork, and the difficulty of showing up well for other people.",
      resonance:
        "It resonates with me because it proves optimism does not have to be shallow. The show has warmth, humor, and a real emotional intelligence that makes it easy to care about.",
    },
    {
      title: "Ozark",
      kicker: "Show",
      creator: "Bill Dubuque and Mark Williams",
      image: "./photos/media/ozark.jpeg",
      overview:
        "After a money-laundering scheme goes wrong, Marty Byrde relocates his family to the Ozarks and tries to keep them alive by building even deeper criminal entanglements. The story keeps escalating through fear, strategy, and compromise as the family is pulled further from any normal life.",
      resonance:
        "I like the constant pressure in it. The show is tense and controlled, and it does a great job of making each bad choice feel like it creates three more problems.",
    },
    {
      title: "Fargo",
      kicker: "Show",
      creator: "Noah Hawley",
      image: "./photos/media/fargo.jpeg",
      overview:
        "Each season tells a different crime story set in the same tonal universe, mixing violence, dark humor, and a very specific sense of Midwestern unease. The show thrives on strange characters, escalating consequences, and the idea that chaos often arrives through very ordinary people making very bad decisions.",
      resonance:
        "It stands out because it is so distinct in tone. I like the blend of menace, absurdity, and precision, and it never feels like it is trying to be anything other than itself.",
    },
    {
      title: "Stranger Things",
      kicker: "Show",
      creator: "The Duffer Brothers",
      image: "./photos/media/strangerthings.jpeg",
      overview:
        "When a boy disappears in a small Indiana town, a group of friends gets pulled into a hidden world of experiments, monsters, and parallel dimensions. The series grows from a local mystery into a larger battle, but it stays grounded by friendship, loyalty, and the feeling of a tight-knit group facing the impossible together.",
      resonance:
        "It works for me because it feels cinematic while still being very character-driven. The nostalgia is fun, but the real draw is how easy it is to care about the people in it.",
    },
    {
      title: "The Bear",
      kicker: "Show",
      creator: "Christopher Storer",
      image: "./photos/media/thebear.jpeg",
      overview:
        "The show follows Carmy as he returns home to run his family's struggling sandwich shop after a personal loss. It becomes a story about grief, ambition, pressure, and trying to build something excellent in an environment that is loud, messy, and emotionally overloaded.",
      resonance:
        "I really like how intensely it captures craft and pressure. It feels chaotic in a believable way, and the obsession with doing something well gives it a lot of energy.",
    },
    {
      title: "Moon Knight",
      kicker: "Show",
      creator: "Jeremy Slater",
      image: "./photos/media/moonknight.jpeg",
      overview:
        "The series follows a man dealing with fractured identity who becomes entangled in supernatural conflict tied to Egyptian mythology. It mixes action with psychological disorientation, making the audience experience the uncertainty of the main character rather than simply watching it from the outside.",
      resonance:
        "It stands out to me because it commits to a more unusual character perspective than a lot of superhero stories. The visual style and psychological tension give it its own identity.",
    },
    {
      title: "Yellowstone",
      kicker: "Show",
      creator: "Taylor Sheridan and John Linson",
      image: "./photos/media/yellowstone.jpeg",
      overview:
        "Centered on the Dutton family and their ranch, the show explores land, legacy, power, and the conflicts that come with trying to hold onto something valuable. It blends family drama, political pressure, and western imagery into a story that feels large and forceful.",
      resonance:
        "I like the scale of it and the sense of force behind the storytelling. The setting is a big part of the appeal, but the family conflict is what keeps it compelling.",
    },
    {
      title: "Peaky Blinders",
      kicker: "Show",
      creator: "Steven Knight",
      image: "./photos/media/peakyblinders.jpeg",
      overview:
        "Set in post-World War I Birmingham, the series follows Tommy Shelby and his family as they grow a criminal enterprise while navigating politics, rival gangs, and personal damage carried home from the war. It is a story about ambition, image, power, and the cost of trying to control everything.",
      resonance:
        "It resonates with me because it feels so visually and tonally complete. The style is memorable, but it still has enough tension and character weight to back that style up.",
    },
  ],
};

function SnakeGame() {
  const boardSize = 14;
  const cellSize = 24;
  const targetRounds = 20;
  const canvasRef = useRef(null);
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });

  const buildFood = (snake) => {
    let candidate = { x: 5, y: 5 };

    do {
      candidate = {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize),
      };
    } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));

    return candidate;
  };

  const createInitialState = () => {
    const snake = [
      { x: 2, y: 7 },
      { x: 1, y: 7 },
      { x: 0, y: 7 },
    ];

    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };

    return {
      snake,
      food: buildFood(snake),
      rounds: 0,
      status: "ready",
      message: "Eat 20 targets to win.",
    };
  };

  const [game, setGame] = useState(createInitialState);

  const resetGame = () => {
    setGame(createInitialState());
  };

  const startGame = () => {
    setGame((current) => {
      if (current.status === "won") {
        return current;
      }

      return {
        ...current,
        status: "playing",
        message: "Use arrow keys or WASD to steer.",
      };
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
        D: { x: 1, y: 0 },
      };

      const next = keyMap[event.key];
      if (!next) {
        if (event.key === " ") {
          event.preventDefault();
          startGame();
        }
        return;
      }

      event.preventDefault();
      const current = directionRef.current;
      if (current.x + next.x === 0 && current.y + next.y === 0) {
        return;
      }

      nextDirectionRef.current = next;
      setGame((currentGame) =>
        currentGame.status === "ready"
          ? {
              ...currentGame,
              status: "playing",
              message: "Use arrow keys or WASD to steer.",
            }
          : currentGame
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (game.status !== "playing") {
      return undefined;
    }

    const tick = window.setInterval(() => {
      setGame((current) => {
        if (current.status !== "playing") {
          return current;
        }

        const direction = nextDirectionRef.current;
        directionRef.current = direction;
        const head = current.snake[0];
        const nextHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        const hitsWall =
          nextHead.x < 0 ||
          nextHead.y < 0 ||
          nextHead.x >= boardSize ||
          nextHead.y >= boardSize;

        const hitsSelf = current.snake.some(
          (segment) => segment.x === nextHead.x && segment.y === nextHead.y
        );

        if (hitsWall || hitsSelf) {
          return {
            ...current,
            status: "lost",
            message: "Crashed. Hit restart and go again.",
          };
        }

        const ateFood =
          nextHead.x === current.food.x && nextHead.y === current.food.y;

        const snake = [nextHead, ...current.snake];
        if (!ateFood) {
          snake.pop();
        }

        const rounds = ateFood ? current.rounds + 1 : current.rounds;

        if (rounds >= targetRounds) {
          return {
            ...current,
            snake,
            rounds,
            status: "won",
            message: "You cleared all 20 rounds.",
          };
        }

        return {
          ...current,
          snake,
          food: ateFood ? buildFood(snake) : current.food,
          rounds,
        };
      });
    }, 120);

    return () => window.clearInterval(tick);
  }, [game.status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = boardSize * cellSize;
    canvas.height = boardSize * cellSize;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#eff8ff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < boardSize; x += 1) {
      for (let y = 0; y < boardSize; y += 1) {
        context.fillStyle = (x + y) % 2 === 0 ? "rgba(61, 121, 184, 0.08)" : "rgba(32, 79, 134, 0.04)";
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    context.fillStyle = "#204f86";
    game.snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? "#204f86" : "#3d79b8";
      context.fillRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    context.fillStyle = "#7dc3ff";
    context.beginPath();
    context.arc(
      game.food.x * cellSize + cellSize / 2,
      game.food.y * cellSize + cellSize / 2,
      cellSize / 2.8,
      0,
      Math.PI * 2
    );
    context.fill();
  }, [game]);

  return html`
    <div className="snake-shell">
      <div className="snake-meta-grid">
        <div className="snake-stat">
          <span className="snake-stat-label">Rounds</span>
          <strong>${game.rounds} / ${targetRounds}</strong>
        </div>
        <div className="snake-stat">
          <span className="snake-stat-label">Status</span>
          <strong>${game.status}</strong>
        </div>
        <div className="snake-stat">
          <span className="snake-stat-label">Controls</span>
          <strong>Arrows or WASD</strong>
        </div>
      </div>

      <div className="snake-board-wrap">
        <canvas ref=${canvasRef} className="snake-board"></canvas>
      </div>

      <p className="snake-message">${game.message}</p>

      <div className="snake-actions">
        <button type="button" className="snake-button primary" onClick=${startGame}>
          ${game.status === "playing" ? "Playing" : game.status === "ready" ? "Start Game" : "Play Again"}
        </button>
        <button type="button" className="snake-button" onClick=${resetGame}>
          Restart
        </button>
      </div>
    </div>
  `;
}


function RockPaperScissorsGame() {
  const choices = ["Rock", "Paper", "Scissors"];
  const [game, setGame] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    message: "Pick a move to start the matchup.",
    playerChoice: null,
    cpuChoice: null,
  });

  const playRound = (playerChoice) => {
    const cpuChoice = choices[Math.floor(Math.random() * choices.length)];
    let outcome = "tie";

    if (playerChoice !== cpuChoice) {
      const winningPairs = {
        Rock: "Scissors",
        Paper: "Rock",
        Scissors: "Paper",
      };
      outcome = winningPairs[playerChoice] === cpuChoice ? "win" : "loss";
    }

    setGame((current) => ({
      rounds: current.rounds + 1,
      wins: current.wins + (outcome === "win" ? 1 : 0),
      losses: current.losses + (outcome === "loss" ? 1 : 0),
      ties: current.ties + (outcome === "tie" ? 1 : 0),
      message:
        outcome === "win"
          ? `${playerChoice} beats ${cpuChoice}. You take the round.`
          : outcome === "loss"
            ? `${cpuChoice} beats ${playerChoice}. CPU wins this one.`
            : `Both picked ${playerChoice}. It is a tie.`,
      playerChoice,
      cpuChoice,
    }));
  };

  const reset = () => {
    setGame({
      rounds: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      message: "Pick a move to start the matchup.",
      playerChoice: null,
      cpuChoice: null,
    });
  };

  return html`
    <div className="mini-game-shell">
      <div className="mini-score-row">
        <div className="mini-score-box"><span>Rounds</span><strong>${game.rounds}</strong></div>
        <div className="mini-score-box"><span>Wins</span><strong>${game.wins}</strong></div>
        <div className="mini-score-box"><span>Losses</span><strong>${game.losses}</strong></div>
        <div className="mini-score-box"><span>Ties</span><strong>${game.ties}</strong></div>
      </div>

      <div className="rps-grid">
        ${choices.map(
          (choice) => html`
            <button type="button" className="arcade-button rps-choice" onClick=${() => playRound(choice)}>
              ${choice}
            </button>
          `
        )}
      </div>

      <div className="rps-versus">
        <div className="rps-side user-side">
          <span className="rps-side-label">You Played</span>
          <strong>${game.playerChoice ?? "Waiting"}</strong>
        </div>
        <div className="rps-vs-badge">VS</div>
        <div className="rps-side cpu-side">
          <span className="rps-side-label">CPU Played</span>
          <strong>${game.cpuChoice ?? "Waiting"}</strong>
        </div>
      </div>

      <div className="rps-result">
        <p>${game.message}</p>
      </div>

      <div className="mini-actions">
        <button type="button" className="arcade-button" onClick=${reset}>Reset Match</button>
      </div>
    </div>
  `;
}

function CheckersMiniGame() {
  const boardSize = 8;

  const createInitialState = () => {
    const pieces = [];
    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < boardSize; x += 1) {
        if ((x + y) % 2 === 1) {
          pieces.push({ id: `cpu-${x}-${y}`, x, y, side: "cpu", king: false });
        }
      }
    }
    for (let y = 5; y < 8; y += 1) {
      for (let x = 0; x < boardSize; x += 1) {
        if ((x + y) % 2 === 1) {
          pieces.push({ id: `user-${x}-${y}`, x, y, side: "user", king: false });
        }
      }
    }
    return {
      pieces,
      selectedId: null,
      turn: "user",
      message: "Your move. Click a checker, then click a destination.",
      status: "playing",
      userCount: 12,
      cpuCount: 12,
    };
  };

  const [game, setGame] = useState(createInitialState);

  const findPiece = (pieces, x, y) => pieces.find((piece) => piece.x === x && piece.y === y) ?? null;

  const getMoves = (piece, pieces) => {
    const directions = [];
    if (piece.side === "user" || piece.king) {
      directions.push([-1, -1], [1, -1]);
    }
    if (piece.side === "cpu" || piece.king) {
      directions.push([-1, 1], [1, 1]);
    }

    const moves = [];
    directions.forEach(([dx, dy]) => {
      const stepX = piece.x + dx;
      const stepY = piece.y + dy;
      if (stepX < 0 || stepY < 0 || stepX >= boardSize || stepY >= boardSize) {
        return;
      }
      const occupant = findPiece(pieces, stepX, stepY);
      if (!occupant) {
        moves.push({ x: stepX, y: stepY, captureId: null });
        return;
      }
      if (occupant.side === piece.side) {
        return;
      }
      const jumpX = piece.x + dx * 2;
      const jumpY = piece.y + dy * 2;
      if (jumpX < 0 || jumpY < 0 || jumpX >= boardSize || jumpY >= boardSize) {
        return;
      }
      if (!findPiece(pieces, jumpX, jumpY)) {
        moves.push({ x: jumpX, y: jumpY, captureId: occupant.id });
      }
    });
    return moves;
  };

  const runCpuTurn = (state) => {
    const cpuPieces = state.pieces.filter((piece) => piece.side === "cpu");
    const moveOptions = cpuPieces.flatMap((piece) =>
      getMoves(piece, state.pieces).map((move) => ({ piece, move }))
    );

    if (!moveOptions.length) {
      return { ...state, status: "won", message: "CPU is out of moves. You win." };
    }

    const preferred = moveOptions.find((option) => option.move.captureId) ?? moveOptions[0];
    let pieces = state.pieces
      .filter((piece) => piece.id !== preferred.move.captureId)
      .map((piece) =>
        piece.id === preferred.piece.id
          ? {
              ...piece,
              x: preferred.move.x,
              y: preferred.move.y,
              king: piece.king || preferred.move.y === boardSize - 1,
            }
          : piece
      );

    const userCount = pieces.filter((piece) => piece.side === "user").length;
    if (!userCount) {
      return {
        ...state,
        pieces,
        userCount,
        cpuCount: pieces.filter((piece) => piece.side === "cpu").length,
        turn: "cpu",
        status: "lost",
        message: "The CPU cleared your last checker.",
      };
    }

    const userHasMoves = pieces
      .filter((piece) => piece.side === "user")
      .some((piece) => getMoves(piece, pieces).length > 0);

    return {
      ...state,
      pieces,
      userCount,
      cpuCount: pieces.filter((piece) => piece.side === "cpu").length,
      selectedId: null,
      turn: "user",
      status: userHasMoves ? "playing" : "lost",
      message: userHasMoves
        ? preferred.move.captureId
          ? "CPU captured a checker. Your move."
          : "CPU moved. Your turn."
        : "You have no legal moves left.",
    };
  };

  const handleSquareClick = (x, y) => {
    setGame((current) => {
      if (current.status !== "playing" || current.turn !== "user") {
        return current;
      }

      const clickedPiece = findPiece(current.pieces, x, y);
      if (clickedPiece?.side === "user") {
        return { ...current, selectedId: clickedPiece.id, message: "Checker selected. Choose a diagonal square." };
      }

      const selected = current.pieces.find((piece) => piece.id === current.selectedId);
      if (!selected) {
        return current;
      }

      const chosenMove = getMoves(selected, current.pieces).find((move) => move.x === x && move.y === y);
      if (!chosenMove) {
        return { ...current, message: "That move is not available. Try a highlighted diagonal path." };
      }

      let pieces = current.pieces
        .filter((piece) => piece.id !== chosenMove.captureId)
        .map((piece) =>
          piece.id === selected.id
            ? { ...piece, x, y, king: piece.king || y === 0 }
            : piece
        );

      const cpuCount = pieces.filter((piece) => piece.side === "cpu").length;
      if (!cpuCount) {
        return {
          ...current,
          pieces,
          cpuCount,
          userCount: pieces.filter((piece) => piece.side === "user").length,
          selectedId: null,
          status: "won",
          message: "You captured the last CPU checker.",
        };
      }

      const cpuHasMoves = pieces
        .filter((piece) => piece.side === "cpu")
        .some((piece) => getMoves(piece, pieces).length > 0);

      const nextState = {
        ...current,
        pieces,
        cpuCount,
        userCount: pieces.filter((piece) => piece.side === "user").length,
        selectedId: null,
        turn: "cpu",
        status: cpuHasMoves ? "playing" : "won",
        message: chosenMove.captureId ? "Nice capture. CPU is thinking..." : "Move played. CPU is thinking...",
      };

      return cpuHasMoves ? runCpuTurn(nextState) : { ...nextState, message: "CPU has no legal moves left. You win." };
    });
  };

  const reset = () => setGame(createInitialState());
  const selected = game.pieces.find((piece) => piece.id === game.selectedId) ?? null;
  const availableMoves = selected ? getMoves(selected, game.pieces) : [];

  const cells = [];
  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const piece = findPiece(game.pieces, x, y);
      const isDark = (x + y) % 2 === 1;
      const isMove = availableMoves.some((move) => move.x === x && move.y === y);
      cells.push(html`
        <button
          key=${`${x}-${y}`}
          type="button"
          className=${`checker-cell ${isDark ? "dark" : "light"}${isMove ? " target" : ""}`}
          onClick=${() => handleSquareClick(x, y)}
        >
          ${piece
            ? html`<span className=${`checker-piece ${piece.side}${piece.king ? " king" : ""}${piece.id === game.selectedId ? " selected" : ""}`}></span>`
            : null}
        </button>
      `);
    }
  }

  return html`
    <div className="mini-game-shell">
      <div className="mini-score-row mini-score-row-compact">
        <div className="mini-score-box"><span>Your Pieces</span><strong>${game.userCount}</strong></div>
        <div className="mini-score-box"><span>CPU Pieces</span><strong>${game.cpuCount}</strong></div>
        <div className="mini-score-box"><span>Status</span><strong>${game.status}</strong></div>
      </div>

      <div className="checker-board">${cells}</div>
      <p className="mini-message">${game.message}</p>

      <div className="mini-actions">
        <button type="button" className="arcade-button" onClick=${reset}>Reset Board</button>
      </div>
    </div>
  `;
}

function ArcadeHub() {
  return html`
    <div className="arcade-stack">
      <article className="arcade-card">
        <div className="arcade-copy-head">
          <p className="arcade-kicker">Cabinet One</p>
          <h3>Snake</h3>
          <p>Classic movement, 20 targets to win, and just enough pressure to make a clean run satisfying.</p>
        </div>
        <${SnakeGame} />
      </article>

      <article className="arcade-card">
        <div className="arcade-copy-head">
          <p className="arcade-kicker">Cabinet Two</p>
          <h3>Rock Paper Scissors</h3>
          <p>A quick head-to-head warmup that keeps score and gives the arcade section a lighter button-based game.</p>
        </div>
        <${RockPaperScissorsGame} />
      </article>

      <article className="arcade-card">
        <div className="arcade-copy-head">
          <p className="arcade-kicker">Cabinet Three</p>
          <h3>Checkers</h3>
          <p>A compact checkers board with click-to-move pieces, simple captures, and a quick CPU opponent.</p>
        </div>
        <${CheckersMiniGame} />
      </article>
    </div>
  `;
}

const sections = [
  {
    id: "home",
    label: "Home",
    eyebrow: "Introduction",
    title: "Engineering depth, steady curiosity, and range.",
    intro:
      "I am Dylan Palmer, a radar cross section engineer at the Johns Hopkins University Applied Physics Laboratory with a background in electromagnetics, advanced materials, and applied defense engineering.",
    highlights: [
      "Radar cross section engineer at Johns Hopkins Applied Physics Laboratory.",
      "Master of Science in electrical engineering with a focus in electromagnetics.",
      "Currently pursuing a Doctor of Engineering in materials science.",
      "Inventor of a novel electromagnetic material for energy attenuation.",
    ],
    cards: [
      {
        title: "Professional Focus",
        body:
          "My work sits at the intersection of radar cross section analysis, wave behavior in matter, RF material design, and computational electromagnetics. I am especially interested in turning technical depth into practical systems and materials that perform under demanding conditions.",
      },
      {
        title: "Outside of Work",
        body:
          "I like disciplined, long-horizon work, whether that means engineering research, doctoral study, distance running, baking, or keeping a running list of books and films worth revisiting.",
      },
    ],
    portraitGallery: [
      { image: "./photos/me1.JPG", alt: "Dylan Palmer portrait 1" },
      { image: "./photos/me2.jpeg", alt: "Dylan Palmer portrait 2" },
      { image: "./photos/me3.jpeg", alt: "Dylan Palmer portrait 3" },
      { image: "./photos/me4.jpeg", alt: "Dylan Palmer portrait 4" },
    ],
    quote:
      "I want this site to reflect the full picture: technical depth, long-term growth, and the parts of life outside work that keep things meaningful.",
  },
  {
    id: "work",
    label: "Work + Education",
    eyebrow: "Career Path",
    title: "A career shaped by electromagnetics, materials, and applied engineering.",
    intro:
      "My academic and professional path has centered on electromagnetics and RF systems, with growing emphasis on material behavior, absorber design, and engineering work that can move from theory into high-consequence applications.",
    highlights: [
      "RCS engineer at Johns Hopkins University Applied Physics Laboratory.",
      "Former RF and E3 engineer at Lockheed Martin.",
      "Master's thesis on a metamaterial absorber.",
      "Doctor of Engineering work in materials science.",
    ],
    cards: [
      {
        title: "Technical Areas",
        body:
          "Electromagnetic wave propagation in matter, wave scattering, radar cross section, electromagnetic material design, electromagnetic compatibility, and computational electromagnetics.",
      },
      {
        title: "Tools and Methods",
        body:
          "Experience with FEKO, CST, MATLAB, CLI-based workflows, RF material development, network analyzer work, and defense-facing engineering processes tied to standards and design reviews.",
      },
    ],
    timeline: [
      {
        title: "Johns Hopkins University Applied Physics Laboratory",
        subtitle: "RCS Engineer",
        period: "January 2025 - Present",
        points: [
          "Perform radar cross section analyses for U.S. government systems.",
          "Invented RF materials designed to attenuate electromagnetic energy.",
          "Lead internal research and development efforts focused on anisotropic medium behavior under electromagnetic conditions.",
        ],
      },
      {
        title: "Johns Hopkins University",
        subtitle: "Doctor of Engineering in Materials Science",
        period: "June 2025 - May 2027",
        points: [
          "Maintaining a 4.0 GPA.",
          "Invented an electromagnetic material for applications requiring electromagnetic attenuation.",
        ],
      },
      {
        title: "Lockheed Martin",
        subtitle: "RF / E3 Engineer",
        period: "August 2022 - January 2025",
        points: [
          "Served as an electromagnetic subject matter expert for missile programs including LRASM.",
          "Supported low observables, radar cross section, electromagnetic environmental effects, and subsystem compliance work.",
          "Wrote test procedures and control plans aligned with MIL-STD-461 and MIL-STD-464, and supported major design reviews and program milestones.",
        ],
      },
      {
        title: "Johns Hopkins University",
        subtitle: "M.S. in Electrical Engineering, Electromagnetics",
        period: "May 2022 - May 2024",
        points: [
          "Completed a master's thesis on a metamaterial absorber.",
          "Published thesis work through Sheridan Libraries.",
          "Graduated with a 3.65 GPA.",
        ],
      },
      {
        title: "Syracuse University",
        subtitle: "B.S. in Electrical Engineering",
        period: "August 2020 - May 2022",
        points: [
          "Graduated cum laude with a 3.47 GPA.",
          "Dean's List in spring 2021, fall 2021, and spring 2022.",
          "Competed in club soccer, including a regional championship run.",
        ],
      },
    ],
    quote:
      "The throughline in my work has been learning how electromagnetic theory becomes something measurable, buildable, and useful.",
  },
  {
    id: "running",
    label: "Running",
    eyebrow: "Strava Dashboard",
    title: "Training data with more shape and context.",
    intro:
      "This section now supports a live Strava connection so it can show weekly totals, yearly progress, personal best efforts, and actual routes you have run instead of a static placeholder.",
    highlights: [
      "Live weekly totals and effort counts.",
      "Year-to-date mileage, time, and elevation.",
      "PR efforts across key race distances.",
      "Route cards based on real Strava activity maps.",
    ],
    cards: [
      {
        title: "What It Pulls In",
        body:
          "The dashboard is wired to Strava for recent weekly training, yearly totals, route maps, and a PR table based on your recorded efforts across common race distances.",
      },
      {
        title: "How It Works",
        body:
          "Because Strava uses OAuth, this part of the site now expects to be served through the new Python backend instead of a plain static file server. Once connected, the running tab can refresh real data for just your account.",
      },
    ],
    quote:
      "Running data is most useful when it reflects the shape of training, not just the raw totals.",
  },
  {
    id: "baking",
    label: "Baking",
    eyebrow: "Kitchen Notebook",
    title: "The bakes worth repeating.",
    intro:
      "Baking gives me a different kind of problem solving: still precise, still iterative, but a lot more generous. This section collects some of the desserts and pastry projects that have been most satisfying to make and share.",
    highlights: [
      "Layer cakes, tarts, pastry work, and holiday desserts.",
      "A mix of comfort bakes and technically demanding projects.",
      "Flavor-first combinations with a soft spot for citrus and chocolate.",
      "Photos from my own kitchen notebook.",
    ],
    cards: [
      {
        title: "What I Like Baking",
        body:
          "I am especially drawn to citrus desserts, layered cakes, tarts, and anything that balances strong flavor with careful technique. The best projects usually combine both precision and a little creativity.",
      },
      {
        title: "What This Section Tracks",
        body:
          "Each bake includes a photo, a quick description, and the flavor or technique that made it memorable. Over time this can become part gallery, part personal recipe archive.",
      },
    ],
    gallery: [
      {
        title: "Grapefruit Tart",
        kicker: "Delicious summer dessert",
        image: "./photos/grapefruit_tart.jpeg",
        body:
          "A bright grapefruit tart layered with Italian meringue and sweetcrust pastry, then finished with candied peel for a sharper citrus edge.",
      },
      {
        title: "Peanut Butter Chocolate Cake",
        kicker: "Favorite childhood flavors",
        image: "./photos/PBcake.jpeg",
        body:
          "Black cocoa cake filled with peanut butter frosting and Reese's cups, then finished with a smooth chocolate ganache for a richer, more nostalgic kind of cake.",
      },
      {
        title: "Reindeer Oreo Pops",
        kicker: "Best for the Christmas holiday",
        image: "./photos/reindeer.jpeg",
        body:
          "Oreos blended with cream cheese, shaped and coated in tempered chocolate, then decorated into a playful holiday treat that looks as good as it disappears.",
      },
      {
        title: "Lemon Cake",
        kicker: "My favorite flavor in cake form",
        image: "./photos/lemon_cake.jpeg",
        body:
          "Almond sponge soaked with almond syrup, layered with lemon curd, and finished with lemon Swiss meringue buttercream and candied lemon garnish.",
      },
      {
        title: "Baklava",
        kicker: "Technically challenging and worth the effort",
        image: "./photos/baklava.jpeg",
        body:
          "A full-day pastry project with filo, pistachios, and walnuts, finished with a rosewater and honey syrup that soaks into every layer.",
      },
      {
        title: "Key Lime Tart",
        kicker: "Another favorite citrus flavor",
        image: "./photos/keylime.jpeg",
        body:
          "A key lime filling in a buttery graham cracker crust, built around clean acidity, creamy texture, and the kind of flavor that always feels like summer.",
      },
    ],
    quote:
      "The best bakes usually live at the intersection of patience, flavor, and the excuse to share them with other people.",
  },
  {
    id: "reviews",
    label: "Favorite Media",
    eyebrow: "Films, Books, and Shows",
    title: "The stories and worlds I keep returning to.",
    intro:
      "This section is less about reviewing everything and more about keeping a shelf of favorites: films worth revisiting, books that linger, and shows that felt genuinely worth the time.",
    highlights: [
      "Filter between films, books, and shows.",
      "Single-column layout with alternating visuals.",
      "A personal shortlist instead of a full watch log.",
      "Built around the titles that have actually stayed with me.",
    ],
    cards: [
      {
        title: "How It Is Organized",
        body:
          "The top filter lets the page switch between films, books, and shows, while the alternating layout keeps the section feeling more like a personal editorial list than a spreadsheet.",
      },
      {
        title: "What Makes The Cut",
        body:
          "These are the titles I would actually recommend or revisit, not just things I finished once. It is meant to show taste, not volume.",
      },
    ],
    quote:
      "The best media does more than entertain. It gives you something to carry around afterward.",
  },
  {
    id: "travel",
    label: "Travel",
    eyebrow: "Trips and Places Lived",
    title: "The places that shaped whole chapters.",
    intro:
      "This section is less of a bucket list and more of a personal map: major trips, meaningful cities, and the places that feel tied to whole stretches of life rather than just a weekend away.",
    highlights: [
      "A mix of major trips and places I have lived.",
      "Photo-forward entries built around atmosphere and memory.",
      "A personal geography instead of a generic travel log.",
      "Cities and places that still feel vivid after the fact.",
    ],
    cards: [
      {
        title: "How This One Works",
        body:
          "Instead of trying to catalog every trip, this section focuses on the locations that actually marked something: a season of life, a major experience, or a place that still comes back clearly in memory.",
      },
      {
        title: "What Makes A Place Stick",
        body:
          "The places that last are usually a mix of setting and timing. Some matter because of the trip itself, and others matter because you built part of your life there.",
      },
    ],
    quote:
      "The places that stay with you usually do so because they attached themselves to a version of who you were at the time.",
  },
  {
    id: "arcade",
    label: "Arcade",
    eyebrow: "Skyline Arcade",
    title: "A small skyline arcade inside the site.",
    intro:
      "This section turns the old Snake tab into a compact arcade corner: a little playful, a little nostalgic, and a nice contrast to the more serious parts of the site.",
    highlights: [
      "Three mini games in one section.",
      "Snake with a 20-round win condition.",
      "Rock Paper Scissors for a quick reset.",
      "A compact checkers match against the CPU.",
    ],
    cards: [
      {
        title: "Why It Works",
        body:
          "A personal website can still feel polished while leaving room for a playful side quest. The arcade section makes the site more memorable and a little more human.",
      },
      {
        title: "How To Play",
        body:
          "Snake uses arrow keys or WASD. Rock Paper Scissors and Checkers are both click-based, which keeps the whole arcade section easy to use on one page.",
      },
    ],
    quote:
      "Serious work and a little play belong in the same portfolio.",
  },
];


function RunningDashboard() {
  const [state, setState] = useState({ loading: true, payload: null, error: null });

  const loadDashboard = async (forceRefresh = false) => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const response = await fetch(`/api/strava/dashboard${forceRefresh ? "?refresh=1" : ""}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load Strava data right now.");
      }
      setState({ loading: false, payload, error: null });
    } catch (error) {
      setState({ loading: false, payload: null, error: error.message });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (state.loading) {
    return html`
      <div className="running-shell">
        <section className="running-connect-panel">
          <p className="running-kicker">Loading dashboard</p>
          <h3>Checking Strava connection and pulling your latest running data.</h3>
          <p>This can take a moment the first time, especially once the site starts building PRs and route cards from your activity history.</p>
        </section>
      </div>
    `;
  }

  if (state.error) {
    return html`
      <div className="running-shell">
        <section className="running-connect-panel">
          <p className="running-kicker">Something needs attention</p>
          <h3>The Strava dashboard hit an error.</h3>
          <p>${state.error}</p>
          <div className="running-actions">
            <button type="button" className="running-button" onClick=${() => loadDashboard(true)}>
              Try again
            </button>
          </div>
        </section>
      </div>
    `;
  }

  const payload = state.payload;
  const redirectUri = `${window.location.origin}/auth/strava/callback`;

  if (!payload?.configured) {
    return html`
      <div className="running-shell">
        <section className="running-connect-panel">
          <p className="running-kicker">One-time setup</p>
          <h3>Strava is not configured yet.</h3>
          <p>The backend is ready, but it still needs this site's Strava app credentials before it can connect.</p>
          <ol className="running-steps">
            <li>Create a Strava app at strava.com/settings/api.</li>
            <li>Set the callback to ${redirectUri}.</li>
            <li>Export STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REDIRECT_URI in the terminal.</li>
            <li>Restart the site with python3 server.py.</li>
          </ol>
        </section>
      </div>
    `;
  }

  if (!payload.connected) {
    return html`
      <div className="running-shell">
        <section className="running-connect-panel">
          <p className="running-kicker">Connect Strava</p>
          <h3>Turn this section into a live training dashboard.</h3>
          <p>Once connected, this tab will show your weekly totals, current-year progress, PR efforts, and route cards built from runs you have actually logged.</p>
          <div className="running-actions">
            <a className="running-button running-button-link" href="/auth/strava/start">Connect my Strava</a>
          </div>
        </section>
      </div>
    `;
  }

  return html`
    <div className="running-shell">
      <div className="running-summary-grid running-summary-grid-two-up">
        <article className="running-stat-card">
          <p className="running-kicker">Current Week</p>
          <h3>${formatMiles(payload.current_week.distance_miles)}</h3>
          <p>${payload.current_week.efforts} efforts, ${formatHours(payload.current_week.moving_time_hours)}, ${formatFeet(payload.current_week.elevation_feet)}</p>
          <span>${formatWeekLabel(payload.current_week.week_start)}</span>
        </article>
        <article className="running-stat-card">
          <p className="running-kicker">Year To Date</p>
          <h3>${formatMiles(payload.yearly_totals.distance_miles)}</h3>
          <p>${payload.yearly_totals.count} runs, ${formatHours(payload.yearly_totals.moving_time_hours)}, ${formatFeet(payload.yearly_totals.elevation_feet)}</p>
          <span>Live from your Strava totals</span>
        </article>
      </div>

      <section className="running-section-block">
        <div className="running-section-head">
          <div>
            <p className="running-kicker">Weekly Totals</p>
            <h3>Recent training rhythm</h3>
          </div>
          <button type="button" className="running-button running-button-secondary" onClick=${() => loadDashboard(true)}>
            Refresh data
          </button>
        </div>
        <div className="running-week-grid">
          ${payload.weekly_totals.map(
            (week) => html`
              <article key=${week.week_start} className="running-week-card">
                <p className="running-week-label">${formatWeekLabel(week.week_start)}</p>
                <strong>${formatMiles(week.distance_miles)}</strong>
                <span>${week.efforts} efforts</span>
                <span>${formatHours(week.moving_time_hours)}</span>
                <span>${formatFeet(week.elevation_feet)}</span>
              </article>
            `
          )}
        </div>
      </section>

      <section className="running-section-block">
        <div className="running-section-head">
          <div>
            <p className="running-kicker">PR Efforts</p>
            <h3>Best recorded efforts by distance</h3>
          </div>
        </div>
        <div className="running-pr-table">
          ${manualPrs.map(
            (pr) => html`
              <div key=${pr.label} className="running-pr-row">
                <div>
                  <strong>${pr.label}</strong>
                  <p>${pr.note}</p>
                </div>
                <div className="running-pr-meta">
                  <span>${pr.time ?? "Add your PR time"}</span>
                </div>
              </div>
            `
          )}
        </div>
      </section>

      <section className="running-section-block">
        <div className="running-section-head">
          <div>
            <p className="running-kicker">Routes</p>
            <h3>Recent routes from runs you actually logged</h3>
          </div>
        </div>
        <div className="running-route-grid">
          ${payload.routes.map(
            (route) => html`
              <article key=${route.activity_url} className="running-route-card">
                <div className="running-route-map">
                  ${route.svg_path
                    ? html`
                        <svg viewBox="0 0 220 120" role="img" aria-label=${`Route preview for ${route.name}`}>
                          <path d=${route.svg_path} />
                        </svg>
                      `
                    : html`<div className="running-route-empty">Treadmill run</div>`}
                </div>
                <div className="running-route-copy">
                  <p className="running-kicker">${formatCalendarDate(route.date)}</p>
                  <h3>${route.name}</h3>
                  ${route.location ? html`<p className="running-route-location">${route.location}</p>` : html`<p className="running-route-location running-route-location-muted">Location not provided by Strava</p>`}
                  <p>${formatMiles(route.distance_miles)} · ${route.moving_time_minutes} min · ${formatFeet(route.elevation_feet)}</p>
                  <a href=${route.activity_url} target="_blank" rel="noreferrer">Open in Strava</a>
                </div>
              </article>
            `
          )}
        </div>
      </section>
    </div>
  `;
}

function TravelSection() {
  return html`
    <div className="travel-stack">
      ${travelLocations.map(
        (location, index) => html`
          <article key=${location.title} className=${`travel-card ${index % 2 === 1 ? "is-reversed" : ""}`}>
            <div className="travel-photo-grid">
              <figure className="travel-photo-main">
                <img src=${location.photos[0]} alt=${location.title} />
              </figure>
              <div className="travel-photo-rail">
                ${location.photos.slice(1).map(
                  (photo) => html`
                    <figure key=${photo} className="travel-photo-small">
                      <img src=${photo} alt=${location.title} />
                    </figure>
                  `
                )}
              </div>
            </div>
            <div className="travel-copy">
              <p className="travel-type">${location.type}</p>
              <h3>${location.title}</h3>
              <p className="travel-summary">${location.summary}</p>
              <p>${location.details}</p>
            </div>
          </article>
        `
      )}
    </div>
  `;
}

function FavoriteMediaSection() {
  const [activeCategory, setActiveCategory] = useState("films");

  const categories = [
    {
      id: "films",
      label: "Films",
      description: "The movies I return to most.",
    },
    {
      id: "books",
      label: "Books",
      description: "Stories and ideas that stayed with me.",
    },
    {
      id: "shows",
      label: "Shows",
      description: "Series worth the time investment.",
    },
  ];

  const items = favoriteMedia[activeCategory];

  return html`
    <div className="media-browser">
      <div className="media-filter-bar" role="tablist" aria-label="Favorite media categories">
        ${categories.map(
          (category) => html`
            <button
              key=${category.id}
              type="button"
              role="tab"
              aria-selected=${activeCategory === category.id}
              className=${`media-filter ${activeCategory === category.id ? "active" : ""}`}
              onClick=${() => setActiveCategory(category.id)}
            >
              <span className="media-filter-label">${category.label}</span>
              <span className="media-filter-meta">${category.description}</span>
            </button>
          `
        )}
      </div>

      <div className="media-stack">
        ${items.map(
          (item, index) => html`
            <article key=${item.title} className=${`media-card ${index % 2 === 1 ? "is-reversed" : ""}`}>
              <figure className="media-visual">
                <img className="media-image" src=${encodeURI(item.image)} alt=${`${item.title} cover art`} />
              </figure>
              <div className="media-copy">
                <p className="media-kicker">${item.kicker}</p>
                <h3>${item.title}</h3>
                <p className="media-credit">${item.creator}</p>
                <p className="media-overview">${item.overview}</p>
                <p className="media-resonance"><span className="media-note-label">Why it resonates:</span> ${item.resonance}</p>
              </div>
            </article>
          `
        )}
      </div>
    </div>
  `;
}

function App() {
  const [activeSection, setActiveSection] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return sections.some((section) => section.id === hash) ? hash : "home";
  });

  const currentSection = useMemo(
    () => sections.find((section) => section.id === activeSection) ?? sections[0],
    [activeSection]
  );

  return html`
    <div className="site-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Dylan Palmer</p>
          <h1>
            Personal website for an <span className="text-pop">engineer</span>, researcher, <span className="text-pop-soft">runner</span>, baker, and
            lifelong learner.
          </h1>
          <p className="hero-text">
            A modern profile site that brings together technical work,
            education, and the parts of life outside the lab that matter just
            as much.
          </p>
        </div>

        <aside className="hero-panel">
          <p className="panel-label">At a glance</p>
          <p className="panel-intro">
            Engineer and researcher focused on electromagnetics, materials, and practical technical work, with equal appreciation for endurance, craft, and curiosity outside the lab.
          </p>

          <div className="glance-grid">
            <div className="glance-item">
              <span className="glance-kicker">Current Role</span>
              <strong>RCS Engineer at APL</strong>
            </div>
            <div className="glance-item">
              <span className="glance-kicker">Academic Track</span>
              <strong>Doctor of Engineering in materials science</strong>
            </div>
            <div className="glance-item">
              <span className="glance-kicker">Specialty</span>
              <strong>Electromagnetics, RF materials, and wave behavior</strong>
            </div>
            <div className="glance-item">
              <span className="glance-kicker">Outside Work</span>
              <strong>Running, baking, reading, films, and travel</strong>
            </div>
          </div>

          <ul className="hero-panel-list">
            <li>Master's in electrical engineering with a focus in electromagnetics</li>
            <li>Developing and inventing electromagnetic absorbing materials</li>
            <li>Interested in difficult technical problems and long-term skill building</li>
          </ul>
        </aside>
      </header>

      <main className="content-grid">
        <nav className="section-nav" aria-label="Website sections">
          ${sections.map((section) => {
            const isActive = section.id === activeSection;
            return html`
              <button
                key=${section.id}
                type="button"
                className=${`nav-item ${isActive ? "active" : ""}`}
                onClick=${() => {
                  setActiveSection(section.id);
                  window.history.replaceState(null, "", `#${section.id}`);
                }}
              >
                <span className="nav-label">${section.label}</span>
                <span className="nav-meta">${section.eyebrow}</span>
              </button>
            `;
          })}
        </nav>

        <section className="detail-panel">
          <p className="eyebrow">${currentSection.eyebrow}</p>
          <h2 className="section-title">${formatTitle(currentSection.title)}</h2>
          <p className="section-intro">${currentSection.intro}</p>

          <div className="highlights">
            ${currentSection.highlights.map(
              (highlight) => html`
                <div key=${highlight} className="highlight-chip">
                  ${highlight}
                </div>
              `
            )}
          </div>

          <div className="card-grid">
            ${currentSection.cards.map(
              (card) => html`
                <article key=${card.title} className="info-card">
                  <h3>${card.title}</h3>
                  <p>${card.body}</p>
                </article>
              `
            )}
          </div>

          ${currentSection.id === "arcade" ? html`<${ArcadeHub} />` : null}
          ${currentSection.id === "running" ? html`<${RunningDashboard} />` : null}
          ${currentSection.id === "travel" ? html`<${TravelSection} />` : null}
          ${currentSection.id === "reviews" ? html`<${FavoriteMediaSection} />` : null}

          ${
            currentSection.portraitGallery
              ? html`
                  <div className="portrait-grid">
                    ${currentSection.portraitGallery.map(
                      (item, index) => html`
                        <figure key=${item.image} className=${`portrait-card portrait-${index + 1}`}>
                          <img className="portrait-image" src=${item.image} alt=${item.alt} />
                        </figure>
                      `
                    )}
                  </div>
                `
              : null
          }

          ${
            currentSection.gallery
              ? html`
                  <div className="baking-grid">
                    ${currentSection.gallery.map(
                      (item) => html`
                        <article key=${item.title} className="bake-card">
                          <img className="bake-image" src=${item.image} alt=${item.title} />
                          <div className="bake-copy">
                            <p className="bake-kicker">${item.kicker}</p>
                            <h3>${item.title}</h3>
                            <p>${item.body}</p>
                          </div>
                        </article>
                      `
                    )}
                  </div>
                `
              : null
          }

          ${
            currentSection.timeline
              ? html`
                  <div className="timeline">
                    ${currentSection.timeline.map(
                      (entry) => html`
                        <article key=${entry.title + entry.period} className="timeline-item">
                          <div className="timeline-header">
                            <div>
                              <h3>${entry.title}</h3>
                              <p className="timeline-subtitle">${entry.subtitle}</p>
                            </div>
                            <p className="timeline-period">${entry.period}</p>
                          </div>
                          <ul className="timeline-points">
                            ${entry.points.map(
                              (point) => html`<li key=${point}>${point}</li>`
                            )}
                          </ul>
                        </article>
                      `
                    )}
                  </div>
                `
              : null
          }

          <blockquote>${currentSection.quote}</blockquote>
        </section>
      </main>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
