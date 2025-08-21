import { router } from "./lib/router/index";
import { authService } from "./services/AuthService";

import Home from "./pages/home/index";
import Anime from "./pages/anime/index";
import Player from "./pages/player/index";
import Search from "./pages/search/index";
import Settings from "./pages/settings/index";
import Auth from "./pages/auth/index";
import { topBar } from "./ui/topbar";

const root = document.getElementById("root");
document.root = root;

document.body.appendChild(topBar());

router.route("/", Home);
router.route("/anime", Anime);
router.route("/player", Player);
router.route("/search", Search);
router.route("/settings", Settings);
router.route("/auth", Auth);

router.navigate("/");

authService.authenticate();
