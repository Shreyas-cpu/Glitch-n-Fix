import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
import { WatchlistItem } from "../../types/market";
            onClick={() => onChangeTab(id)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === id
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-zinc-600 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>
    </aside>
  );
}