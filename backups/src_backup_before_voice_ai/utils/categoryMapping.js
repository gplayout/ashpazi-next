import {
    Pizza, Soup, Coffee, Utensils, Salad, UtensilsCrossed,
    Sandwich, Egg, Drumstick, Flame, Beef, Wheat,
    ChefHat, Clock, Heart, Star, Search
} from 'lucide-react';

export const categoryMapping = {
    "انواع خوراک ماکارونی": {
        icon: UtensilsCrossed,
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80", // Pasta
        gradient: "from-orange-400 to-red-500"
    },
    "انواع پلو و چلو": {
        icon: Wheat,
        image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80", // Rice
        gradient: "from-yellow-400 to-orange-500"
    },
    "انواع دلمه و کوکو": {
        icon: Disc,
        image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=800&q=80", // Falafel/Cutlet style
        gradient: "from-green-400 to-emerald-500"
    },
    "انواع سوپ": {
        icon: Soup,
        image: "https://images.unsplash.com/photo-1547592166-23acbe3a624b?auto=format&fit=crop&w=800&q=80", // Soup
        gradient: "from-teal-400 to-cyan-500"
    },
    "غذای گیاه خواران": {
        icon: Salad,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", // Salad
        gradient: "from-green-500 to-lime-500"
    },
    "انواع اردور": {
        icon: Star,
        image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80", // Appetizer
        gradient: "from-pink-400 to-rose-500"
    },
    "ساندویچ ها": {
        icon: Sandwich,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80", // Sandwich
        gradient: "from-orange-400 to-amber-500"
    },
    "املت ها": {
        icon: Egg,
        image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80", // Omelette
        gradient: "from-yellow-300 to-yellow-500"
    },
    "انواع خوراک مرغ و پرنده": {
        icon: Drumstick,
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80", // Chicken
        gradient: "from-red-400 to-orange-500"
    },
    "چند نوع خوراک": {
        icon: Utensils,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", // General Food
        gradient: "from-indigo-400 to-purple-500"
    },
    "انواع پیتزا": {
        icon: Pizza,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", // Pizza
        gradient: "from-red-500 to-orange-600"
    },
    "انواع کباب": {
        icon: Flame,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", // BBQ/Kebab
        gradient: "from-orange-500 to-red-600"
    },
    "شامی ها و کتلت ها - کوفته ها": {
        icon: Beef,
        image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80", // Meatballs
        gradient: "from-amber-600 to-orange-700"
    },
    "خورش ها و قلیه ها": {
        icon: Soup,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80", // Persian Stew style
        gradient: "from-yellow-500 to-orange-600"
    },
    "انواع غذاهای گوشتی": {
        icon: Beef,
        image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=800&q=80", // Meat
        gradient: "from-red-600 to-rose-700"
    },
    "سوفله ها و فوندو": {
        icon: Coffee,
        image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80", // Souffle
        gradient: "from-pink-300 to-rose-400"
    },
    "غذاهای فرنگی": {
        icon: UtensilsCrossed,
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", // Western
        gradient: "from-blue-400 to-indigo-500"
    },
    "آشپزی با مایکروفر و ماکروویو": {
        icon: Clock,
        image: "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=800&q=80", // Kitchen
        gradient: "from-gray-400 to-slate-500"
    },
    "غذاهای ساده": {
        icon: Egg,
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80", // Simple
        gradient: "from-green-300 to-emerald-400"
    },
    "خوراکهای سبزیجات": {
        icon: Salad,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80", // Veggies
        gradient: "from-green-400 to-lime-500"
    }
};

// Fallback for unknown categories
export const defaultCategory = {
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
    gradient: "from-gray-400 to-gray-600"
};

import { Disc } from 'lucide-react'; // Import Disc separately if needed or just use Utensils
