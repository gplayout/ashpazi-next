
import automatedTranslations from '../data/translations.en.json';

// Simulates an AI Translation Service with a local dictionary for demo purposes
// In a real app, this would call an OpenAI/Google Translate API

export const getTranslation = (recipe) => {
    // 1. Check automated translations by ID
    if (recipe?.id && automatedTranslations[recipe.id]) {
        return automatedTranslations[recipe.id];
    }

    // 2. Check legacy manual translations by Name
    if (recipe?.name && translationDB[recipe.name]) {
        return translationDB[recipe.name];
    }

    return null;
};

export const translationDB = {

    "ماکارونی گوشت گوساله": {
        name: "Veal Macaroni",
        description: "A delicious and hearty macaroni dish with veal, mushrooms, and special spices."
    },
    "سالاد ماکارونی": {
        name: "Macaroni Salad",
        description: "A cold and refreshing pasta salad with vegetables and chicken ham."
    },
    "پاستای پنیری": {
        name: "Cheesy Pasta",
        description: "Creamy and rich pasta with fresh mozzarella and basil."
    },
    "اسپاگتی ماتری چیانا": {
        name: "Spaghetti Amatriciana",
        description: "A classic Italian pasta dish with a spicy tomato sauce."
    },
    "ماکارونی با پنیر": {
        name: "Macaroni and Cheese",
        description: "Classic comfort food with a creamy cheese sauce."
    },
    "لازانیا 2": {
        name: "Lasagna Special",
        description: "A rich lasagna with minced meat, bell peppers, and plenty of cheese."
    },
    "لازانيا نان تست": {
        name: "Toast Lasagna",
        description: "A creative lasagna using toast bread, béchamel sauce, and meat filling."
    },
    "پاستا با سس گردو": {
        name: "Pasta with Walnut Sauce",
        description: "Pasta served with a rich and nutty walnut and cream sauce."
    },
    "اسپاگتی با سس مرغ": {
        name: "Spaghetti with Chicken Sauce",
        description: "Spaghetti served with a savory chicken and tomato sauce."
    },
    "اسپاگتی تن ماهی": {
        name: "Tuna Spaghetti",
        description: "A quick and tasty spaghetti dish with tuna and tomato sauce."
    },
    "ماکارونی با میگو و نان": {
        name: "Macaroni with Shrimp",
        description: "Macaroni tossed with sautéed shrimp and crispy breadcrumbs."
    },
    "ماکارونی سرد با پنیر": {
        name: "Cold Macaroni with Cheese",
        description: "A cold pasta salad with cheese, ham, and fresh herbs."
    },
    "ماکارونی با گوشت و سس مخصوص": {
        name: "Macaroni with Meat Sauce",
        description: "Macaroni served with a special meat sauce flavored with herbs."
    },
    "ماکارونی رنگی": {
        name: "Colorful Macaroni",
        description: "A vibrant pasta dish with bell peppers, corn, and avocado."
    },
    "ماکارونی پنیر": {
        name: "Cheese Macaroni",
        description: "Simple and delicious macaroni with cheddar cheese sauce."
    },
    "ماکارونی فوری با سس مخصوص": {
        name: "Instant Macaroni Special",
        description: "Quickly prepared macaroni with a special chicken and vegetable sauce."
    },
    "پاستا با سس انار": {
        name: "Pasta with Pomegranate Sauce",
        description: "Unique pasta dish with a tangy pomegranate and walnut sauce."
    },
    "ماكارونی با تن ماهی": {
        name: "Macaroni with Tuna",
        description: "Macaroni mixed with tuna, vegetables, and spices."
    },
    "خوراک سرد ماکارونی": {
        name: "Cold Macaroni Dish",
        description: "A refreshing cold macaroni dish with chicken and cheddar cheese."
    },
    "پاستا براكلي": {
        name: "Broccoli Pasta",
        description: "Healthy pasta with broccoli, garlic, and chili."
    },
    "پاستا با خامه و گوجه فرنگی": {
        name: "Creamy Tomato Pasta",
        description: "Pasta in a smooth rose sauce made with cream and tomatoes."
    },
    "فتوچینی با سس راتاتویی": {
        name: "Fettuccine Ratatouille",
        description: "Fettuccine served with a vegetable-rich ratatouille sauce."
    },
    "پاستای گوجه فرنگی و کدو": {
        name: "Tomato & Zucchini Pasta",
        description: "Light pasta with fresh tomatoes, zucchini, and mushrooms."
    },
    "رولت اسفناج و پنیر": {
        name: "Spinach & Cheese Roll",
        description: "Lasagna rolls filled with a spinach and cheese mixture."
    },
    "پاستا چيكن آلفردو": {
        name: "Chicken Alfredo Pasta",
        description: "Classic creamy Alfredo pasta with grilled chicken."
    },
    "لازانيا": {
        name: "Classic Lasagna",
        description: "Traditional lasagna with layers of meat sauce, cheese, and pasta."
    },
    "ماکارونی": {
        name: "Persian Macaroni",
        description: "Traditional Persian style macaroni with meat and potato tahdig."
    },
    "ماکارونی با سس گرونا": {
        name: "Macaroni Verona",
        description: "Macaroni with a special creamy vegetable sauce."
    },
    "اسپاگتی پنیر ایتالیایی": {
        name: "Italian Cheese Spaghetti",
        description: "Spaghetti with gorgonzola cheese and tomato sauce."
    },
    "نودل با سویا و فلفل": {
        name: "Soy & Pepper Noodles",
        description: "Stir-fried noodles with soy protein and bell peppers."
    },
    "ماکارونی با سس فلفل": {
        name: "Pepper Sauce Macaroni",
        description: "Spicy macaroni with a rich pepper and soy sauce."
    },
    "خوراک ویژه نودلز یا ماکارونی رشته ای": {
        name: "Special Noodle Dish",
        description: "A creamy noodle dish with chicken, mushrooms, and cheese."
    },
    "ماکارونی با پنیر و گردو": {
        name: "Walnut & Cheese Macaroni",
        description: "Macaroni with a unique walnut oil and cheese dressing."
    },
    "خوراک ماکارونی با ماهی": {
        name: "Macaroni Fish Dish",
        description: "Macaroni served with fish and a tangy tomato sauce."
    },
    "ماکارونی با لوبیا": {
        name: "Macaroni with Beans",
        description: "Pasta salad with green beans, chickpeas, and tomatoes."
    },
    "خوراک تند ماکارونی": {
        name: "Spicy Macaroni",
        description: "A spicy macaroni dish with pineapple and coconut milk."
    },
    "خوراک ماکارونی و بروکلی": {
        name: "Macaroni & Broccoli",
        description: "Macaroni with broccoli, garlic, and parmesan cheese."
    },
    "ماکارونی با آناناس": {
        name: "Pineapple Macaroni",
        description: "A sweet and savory macaroni salad with pineapple and ham."
    },
    "ماکارونی با ماست و سیر": {
        name: "Yogurt & Garlic Macaroni",
        description: "Macaroni topped with a yogurt garlic sauce and meat."
    },
    "اسپاگتی جزیره سیسیل": {
        name: "Sicilian Spaghetti",
        description: "Spaghetti with anchovies, olives, and capers."
    },
    "اسپاگتی با تن ماهی": {
        name: "Spaghetti with Tuna",
        description: "Simple spaghetti with tuna and tomato sauce."
    },
    "ماکارونی با کالباس و گوجه‌فرنگی تازه": {
        name: "Ham & Tomato Macaroni",
        description: "Macaroni with fresh tomatoes and ham."
    },
    "پاستا با سس آلفردو و مرغ": {
        name: "Chicken Alfredo Pasta",
        description: "Rich and creamy pasta with tender chicken breast."
    },
    "ماکارونی سوسیس": {
        name: "Sausage Macaroni",
        description: "Macaroni with sausages and beans in tomato sauce."
    },
    "پاستا با سُس سبز": {
        name: "Green Sauce Pasta",
        description: "Pasta with a fresh herb and walnut pesto sauce."
    },
    "لازانیا با قارچ": {
        name: "Mushroom Lasagna",
        description: "Lasagna layered with mushrooms, meat, and white sauce."
    },
    "ماکارونی با قارچ و میگو": {
        name: "Shrimp & Mushroom Macaroni",
        description: "Macaroni with shrimp and mushrooms in a tomato sauce."
    },
    "ماکارونی با ماهی": {
        name: "Fish Macaroni",
        description: "Macaroni baked with fish and tomato sauce."
    },
    "پاستا": {
        name: "Pasta",
        description: "General pasta dish with meat and mushrooms."
    },
    "اسپاگتی‌ با سس‌ راتاتول‌": {
        name: "Ratatouille Spaghetti",
        description: "Spaghetti served with a vegetable ratatouille sauce."
    },
    "ماکارونی سبز با گوشت": {
        name: "Green Macaroni with Meat",
        description: "Spinach macaroni served with meat sauce."
    },
    "پاستا با نخود، پاستا با فلفل و کلم بروکلی": {
        name: "Chickpea & Broccoli Pasta",
        description: "Two pasta variations: one with chickpeas, one with broccoli."
    },
    "ماکارونی های رنگی": {
        name: "Colorful Pasta",
        description: "Pasta with colorful bell peppers and vegetables."
    },
    "اسپاگتی انواع سبزیها": {
        name: "Vegetable Spaghetti",
        description: "Spaghetti loaded with various fresh vegetables."
    },
    "ماکارونی پیچی (پاستا) با قارچ و ریحان": {
        name: "Fusilli with Mushroom",
        description: "Fusilli pasta with mushrooms, meat, and fresh basil."
    },
    "خوراک ماکارونی پیچ با سوسیس و قارچ": {
        name: "Sausage & Mushroom Fusilli",
        description: "Fusilli pasta with sausages, mushrooms, and celery."
    },
    "اسپاگتی با سس مارنیارا": {
        name: "Marinara Spaghetti",
        description: "Classic spaghetti with homemade marinara sauce."
    },
    "گوجه کبابی با طعم ریحان": {
        name: "Grilled Tomatoes with Basil",
        description: "A simple yet flavorful side dish featuring grilled tomatoes and fresh basil.",
        ingredients: [
            "Tomatoes - 4 medium",
            "Olive Oil - 2 tbsp",
            "Fresh Basil, chopped - 1/2 cup",
            "Garlic, minced - 2 cloves",
            "Salt and Black Pepper - to taste",
            "Balsamic Vinegar (optional) - 1 tbsp"
        ],
        instructions: [
            "Cut the tomatoes in half horizontally.",
            "Brush the cut sides with olive oil and season with salt and pepper.",
            "Grill the tomatoes cut-side down for about 3-4 minutes until charred.",
            "Flip and grill for another 2 minutes.",
            "In a small bowl, mix the chopped basil, minced garlic, and remaining olive oil.",
            "Spoon the basil mixture over the grilled tomatoes.",
            "Drizzle with balsamic vinegar if desired and serve warm."
        ]
    },
    "یک نوع پلوی تایلندی": {
        name: "Thai Style Rice",
        description: "A flavorful Thai rice dish with shrimp, tomatoes, and spices."
    },
    "سوپ پیاز و تره فرنگی": {
        name: "Onion & Leek Soup",
        description: "A classic French-style soup made with caramelized onions and leeks."
    },
    "سوپ کرفس": {
        name: "Celery Soup",
        description: "A light and healthy soup made with fresh celery and vegetables."
    },
    "سوپ ذرت خامه دار": {
        name: "Creamy Corn Soup",
        description: "Rich and creamy soup with sweet corn kernels."
    },
    "سوپ‌ گوجه‌فرنگی‌ با ماكارونی‌ و كوفته‌ ریزه‌": {
        name: "Tomato Soup with Pasta & Meatballs",
        description: "Hearty tomato soup with small meatballs and pasta shells."
    },
    "سوپ قارچ": {
        name: "Mushroom Soup",
        description: "Creamy soup made with fresh mushrooms and herbs."
    },
    "سوپ‌ گوجه‌ فرنگی": {
        name: "Tomato Soup",
        description: "Classic tomato soup, perfect for a light meal."
    },
    "سوپ‌ جعفری‌": {
        name: "Parsley Soup",
        description: "A fresh and green soup featuring parsley as the main ingredient."
    },
    "سوپ‌ اسفناج‌ و خامه‌": {
        name: "Spinach & Cream Soup",
        description: "Smooth and creamy spinach soup."
    },
    "سوپ‌ لوبیاسفید": {
        name: "White Bean Soup",
        description: "Nutritious soup made with white beans and vegetables."
    },
    "سوپ‌ اسفناج": {
        name: "Spinach Soup",
        description: "Healthy spinach soup with a touch of cream."
    },
    "سوپ‌ خیار و نعناع‌": {
        name: "Cucumber & Mint Soup",
        description: "A refreshing cold soup with cucumber and fresh mint."
    },
    "كرم سوپ ماهی": {
        name: "Creamy Fish Soup",
        description: "Delicate cream soup made with fish stock and fillet."
    },
    "سوپ جو": {
        name: "Barley Soup (Soup-e Jo)",
        description: "Traditional Persian barley soup with chicken and carrots."
    },
    "سوپ ماكارونی با نخودفرنگی": {
        name: "Pasta & Pea Soup",
        description: "Simple soup with pasta shapes and green peas."
    },
    "سوپ‌ مرغ‌ با كاری‌": {
        name: "Curry Chicken Soup",
        description: "Spicy and warming chicken soup with curry powder."
    },
    "سوپ با تره فرنگی": {
        name: "Leek Soup",
        description: "Comforting soup made with plenty of leeks."
    },
    "سوپ گوجه و ریحان": {
        name: "Tomato & Basil Soup",
        description: "A perfect pairing of ripe tomatoes and fresh basil."
    },
    "سوپ عدسی (یونانی)": {
        name: "Greek Lentil Soup",
        description: "Lentil soup prepared Greek style with olive oil and vinegar."
    },
    "سوپ ویژه با عدس": {
        name: "Special Lentil Soup",
        description: "A rich lentil soup with added spices and vegetables."
    },
    "سوپ سیب زمینی": {
        name: "Potato Soup",
        description: "Thick and creamy potato soup."
    },
    "سوپ اسپاگتی": {
        name: "Spaghetti Soup",
        description: "Soup made with broken spaghetti noodles and tomato base."
    },
    "سوپ لبو خوش‌رنگ و خوشمزه": {
        name: "Beetroot Soup",
        description: "Vibrant and delicious soup made with red beets."
    },
    "سوپ اسپانیائی": {
        name: "Spanish Soup",
        description: "A hearty soup with Spanish flavors."
    },
    "سوپ تره‌فرنگی و کدو حلوایی": {
        name: "Leek & Pumpkin Soup",
        description: "Sweet and savory soup with pumpkin and leeks."
    },
    "سوپ بره مراکشی": {
        name: "Moroccan Lamb Soup (Harira)",
        description: "Traditional Moroccan soup with lamb, lentils, and chickpeas."
    },
    "سوپ لپه": {
        name: "Split Pea Soup",
        description: "Soup made with yellow split peas and meat stock."
    },
    "سوپ شیر باتره فرنگی": {
        name: "Milk & Leek Soup",
        description: "Creamy soup with milk base and leeks."
    },
    "سوپ برنج و مرغ": {
        name: "Chicken & Rice Soup",
        description: "Comfort food classic with chicken and rice."
    },
    "سوپ ماکارونی": {
        name: "Macaroni Soup",
        description: "Soup with macaroni pasta."
    },
    "سوپ رشته فرنگی": {
        name: "Vermicelli Soup (Soup-e Reshteh)",
        description: "Light soup with thin vermicelli noodles."
    },
    "نان سوپ": {
        name: "Soup Bread",
        description: "Bread bowl or croutons specifically for serving with soup."
    },
    "سوپ نخودفرنگی، سوپ فصل": {
        name: "Pea Soup",
        description: "Fresh green pea soup, perfect for spring."
    },
    "سوپ قارچ و جو": {
        name: "Mushroom & Barley Soup",
        description: "Hearty combination of mushrooms and barley."
    },
    "سوپ سیب زمینی و پنیر": {
        name: "Potato & Cheese Soup",
        description: "Cheesy potato soup, rich and filling."
    },
    "سوپ مرغ": {
        name: "Chicken Soup",
        description: "Classic chicken soup for the soul."
    },
    "سوپ‌ عدس‌ و كرفس": {
        name: "Lentil & Celery Soup",
        description: "Healthy soup combining lentils and celery."
    },
    "سوپ‌ قارچ‌ با شیر": {
        name: "Creamy Mushroom Soup",
        description: "Mushroom soup made creamy with milk."
    },
    "سوپ گوشت قلقلی مكزیكی": {
        name: "Mexican Meatball Soup",
        description: "Spicy soup with small meatballs and Mexican spices."
    },
    "عصاره گوشت": {
        name: "Meat Stock",
        description: "Homemade concentrated meat stock for soups and stews."
    },
    "سوپ فرانسوی": {
        name: "French Onion Soup",
        description: "Classic French onion soup with toasted bread and cheese."
    },
    "چگونه سوپ خود را خوشمزه کنیم؟": {
        name: "Soup Making Tips",
        description: "Tips and tricks to make your soups more delicious."
    },
    "سوپ ماست و اسفناج": {
        name: "Yogurt & Spinach Soup",
        description: "Tangy and creamy soup with yogurt and spinach."
    },
    "سوپ ذرت (چینی)": {
        name: "Chinese Corn Soup",
        description: "Chinese style sweet corn soup with egg drop."
    },
    "سوپ هویج و سیب با پودر كاری": {
        name: "Curried Carrot & Apple Soup",
        description: "Unique soup with sweet carrots, apples, and curry spice."
    },
    "برش": {
        name: "Borscht",
        description: "Traditional Eastern European beet soup."
    },
    "سوپ اسکاتلندی": {
        name: "Scottish Soup",
        description: "Hearty soup with barley and meat, Scottish style."
    },
    "سوپ ژولین": {
        name: "Julienne Soup",
        description: "Soup with vegetables cut into thin julienne strips."
    },
    "سوپ بادام زمینی": {
        name: "Peanut Soup",
        description: "Rich and nutty soup made with peanuts."
    },
    "برشت": {
        name: "Borscht",
        description: "Beetroot soup."
    },
    "نکاتی برای تهیه سوپ‌ها": {
        name: "Soup Preparation Tips",
        description: "Guide to preparing various types of soups."
    },
    "سوپ بر کشایر": {
        name: "Berkshire Soup",
        description: "A regional soup specialty."
    },
    "سوپ کلم": {
        name: "Cabbage Soup",
        description: "Simple and healthy cabbage soup."
    },
    "سوپ سرد هندی": {
        name: "Cold Indian Soup",
        description: "Chilled soup with Indian spices."
    },
    "سوپ مجلسی": {
        name: "Formal Dinner Soup",
        description: "Elegant soup suitable for dinner parties."
    },
    "پتاژ قارچ با پنیر پیتزا": {
        name: "Mushroom Potage with Cheese",
        description: "Thick mushroom soup topped with melted cheese."
    },
    "پتاژ قارچ و گوجه فرنگي": {
        name: "Mushroom & Tomato Potage",
        description: "Thick soup blending mushrooms and tomatoes."
    },
    "پتاژ باقلای سبز": {
        name: "Green Fava Bean Potage",
        description: "Creamy soup made with fresh fava beans."
    },
    "پتاژ مارچوبه": {
        name: "Asparagus Potage",
        description: "Elegant cream of asparagus soup."
    },
    "پتاژ لوبيا سفيد": {
        name: "White Bean Potage",
        description: "Thick and creamy white bean soup."
    },
    "پتاژ قارچ": {
        name: "Mushroom Potage",
        description: "Thick mushroom cream soup."
    },
    "پتاژ گوجه فرنگي": {
        name: "Tomato Potage",
        description: "Thick and creamy tomato soup."
    },
    "پتاژ عدس": {
        name: "Lentil Potage",
        description: "Thick lentil soup."
    },
    "پتاژ سيب زميني": {
        name: "Potato Potage",
        description: "Thick potato soup."
    },
    "پتاژ برنج": {
        name: "Rice Potage",
        description: "Creamy rice-based soup."
    },
    "پتاژ باقلاي سبز": {
        name: "Green Fava Bean Potage",
        description: "Creamy fava bean soup."
    },
    "پتاژ آرد جو": {
        name: "Barley Flour Potage",
        description: "Thick soup thickened with barley flour."
    },
    "پتاژ آرتيشو": {
        name: "Artichoke Potage",
        description: "Cream of artichoke soup."
    },
    "پتاژ قارچ با پنیر فیلا فیلا": {
        name: "Mushroom Potage with Phila Cheese",
        description: "Mushroom soup with Phila Phila cheese."
    },
    "پتاژ جو یا برنج با مایکروفر": {
        name: "Microwave Barley/Rice Potage",
        description: "Quick potage made in the microwave."
    },
    "كنسومه گوجه فرنگي": {
        name: "Tomato Consommé",
        description: "Clear tomato soup."
    },
    "كنسومه قارچ": {
        name: "Mushroom Consommé",
        description: "Clear mushroom soup."
    },
    "كنسومه سبزي": {
        name: "Vegetable Consommé",
        description: "Clear vegetable broth."
    },
    "كنسومه پنير": {
        name: "Cheese Consommé",
        description: "Clear broth served with cheese."
    },
    "كنسومه برنج": {
        name: "Rice Consommé",
        description: "Clear broth with rice."
    },
    "لازانیا گیاهی": {
        name: "Vegetarian Lasagna",
        description: "Lasagna made with vegetables instead of meat."
    },
    "املت دیلتانین": {
        name: "Diltanin Omelet",
        description: "A rich omelet with tomatoes, cheese, and herbs."
    },
    "املت ریحان": {
        name: "Basil Omelet",
        description: "Fresh basil and tomato omelet."
    },
    "املت بادمجان": {
        name: "Eggplant Omelet",
        description: "Omelet made with fried eggplant slices."
    },
    "املت رول اسفناج": {
        name: "Spinach Roll Omelet",
        description: "Rolled omelet filled with spinach and cheese."
    },
    "املت سوسیس و پیازچه": {
        name: "Sausage & Scallion Omelet",
        description: "Savory omelet with sausage and green onions."
    },
    "املت سیب زمینی و سبزیجات": {
        name: "Potato & Veggie Omelet",
        description: "Hearty omelet with potatoes and mixed vegetables."
    },
    "املت با پیازچه": {
        name: "Scallion Omelet",
        description: "Simple and tasty omelet with fresh scallions."
    },
    "تخم مرغ با خمیر سیب زمینی": {
        name: "Eggs with Potato Dough",
        description: "Eggs served over a potato-based dough."
    },
    "یه املت خوشمزه": {
        name: "Delicious Omelet",
        description: "A special omelet recipe with mushrooms and cheese."
    },
    "املت اسپانیایی": {
        name: "Spanish Omelet",
        description: "Classic Spanish tortilla with potatoes and onions."
    },
    "املت با ادویه مخصوص": {
        name: "Spiced Omelet",
        description: "Omelet seasoned with a special blend of spices."
    },
    "املت سیب زمینی": {
        name: "Potato Omelet",
        description: "Simple omelet with diced potatoes."
    },
    "املت اسفناج (نرگسی)": {
        name: "Spinach Omelet (Nargesi)",
        description: "Traditional Persian spinach and egg dish."
    },
    "املت فلفل و پیاز": {
        name: "Pepper & Onion Omelet",
        description: "Omelet with bell peppers and onions."
    },
    "املت فلفل و خامه": {
        name: "Pepper & Cream Omelet",
        description: "Creamy omelet with bell peppers."
    },
    "املت سبزیجات": {
        name: "Vegetable Omelet",
        description: "Healthy omelet packed with various vegetables."
    },
    "املت گوجه فرنگی": {
        name: "Tomato Omelet",
        description: "Classic tomato omelet."
    },
    "املت با طعم ماهی": {
        name: "Fish Flavored Omelet",
        description: "Omelet made with tuna fish."
    },
    "املت هندی": {
        name: "Indian Omelet",
        description: "Spicy Indian-style omelet."
    },
    "املت گوجه فرنگی با پنیر": {
        name: "Tomato & Cheese Omelet",
        description: "Tomato omelet topped with melted cheese."
    },
    "املت توت‌فرنگی": {
        name: "Strawberry Omelet",
        description: "Sweet dessert omelet with strawberries."
    },
    "املت نان تست ( زمان پخت:۱۰ دقیقه )": {
        name: "Toast Omelet",
        description: "Quick omelet served on or with toast."
    },
    "املت یونانی": {
        name: "Greek Omelet",
        description: "Omelet with spinach, olives, and feta cheese."
    },
    "املت قارچ": {
        name: "Mushroom Omelet",
        description: "Omelet filled with sautéed mushrooms."
    },
    "املت‌ سبزی‌": {
        name: "Herb Omelet",
        description: "Omelet with fresh herbs."
    },
    "نکات برای تهیه املت و نیمرو": {
        name: "Omelet & Fried Egg Tips",
        description: "Tips for making the perfect omelet and fried eggs."
    },
    "املت کالباس و ژامبون": {
        name: "Sausage & Ham Omelet",
        description: "Meat lover's omelet with sausage and ham."
    },
    "املت قارچ و مارچوبه": {
        name: "Mushroom & Asparagus Omelet",
        description: "Elegant omelet with mushrooms and asparagus."
    },
    "املت مرغ": {
        name: "Chicken Omelet",
        description: "Omelet filled with chicken."
    },
    "املت با سوسیس، کالباس": {
        name: "Sausage & Ham Omelet",
        description: "Omelet with sausage and cold cuts."
    },
    "املت": {
        name: "Omelet",
        description: "Classic plain omelet."
    },
    "یک نوع املت ساده و آسان": {
        name: "Simple Omelet",
        description: "Easy to make omelet recipe."
    },
    "املت فلفل و ژامبون": {
        name: "Pepper & Ham Omelet",
        description: "Omelet with bell peppers and ham."
    },
    "املت شکر": {
        name: "Sweet Sugar Omelet",
        description: "Sweet omelet sprinkled with sugar."
    },
    "املت پنیر": {
        name: "Cheese Omelet",
        description: "Omelet filled with cheese."
    },
    "املت مربا": {
        name: "Jam Omelet",
        description: "Sweet omelet filled with jam."
    },
    "املت جگر مرغ یا بره": {
        name: "Liver Omelet",
        description: "Omelet with chicken or lamb liver."
    },
    "املت گوشت": {
        name: "Meat Omelet",
        description: "Omelet with ground meat filling."
    },
    "املت تخم مرغ با ذرت": {
        name: "Corn Omelet",
        description: "Omelet with sweet corn."
    },
    "املت کالباس": {
        name: "Ham Omelet",
        description: "Omelet with ham."
    },
    "املت گوجه فرنگی و تن": {
        name: "Tomato & Tuna Omelet",
        description: "Omelet with tomatoes and tuna."
    },
    "املت گوشت و تخم مرغ": {
        name: "Meat & Egg Omelet",
        description: "Hearty omelet with meat."
    },
    "کتف کنجد دار": {
        name: "Sesame Chicken Wings",
        description: "Chicken wings coated in sesame seeds."
    },
    "شنسل شتر مرغ": {
        name: "Ostrich Schnitzel",
        description: "Breaded and fried ostrich meat."
    },
    "رولت مرغ با سبزیجات": {
        name: "Chicken Vegetable Roulade",
        description: "Chicken breast rolled with mixed vegetables."
    },
    "ران مرغ سوخاری با سس ماست": {
        name: "Fried Chicken with Yogurt Sauce",
        description: "Crispy fried chicken thighs served with a yogurt dip."
    },
    "مرغ درسته در فر": {
        name: "Whole Roasted Chicken",
        description: "Whole chicken roasted in the oven."
    },
    "فیله مرغ و میگو بادامی": {
        name: "Almond Chicken & Shrimp",
        description: "Chicken and shrimp dish with almonds."
    },
    "پای مرغ": {
        name: "Chicken Pie",
        description: "Savory pie filled with chicken and vegetables."
    },
    "مرغ اسپایسی": {
        name: "Spicy Chicken",
        description: "Spicy fried chicken."
    },
    "کیک مرغ": {
        name: "Chicken Cake",
        description: "Savory cake made with chicken and vegetables."
    },
    "خوراک فیله مرغ": {
        name: "Chicken Fillet Dish",
        description: "Sautéed chicken fillets with vegetables."
    },
    "مرغ ذغالی": {
        name: "Charcoal Chicken",
        description: "Smoky charcoal-grilled chicken."
    },
    "استیک بوقلمون": {
        name: "Turkey Steak",
        description: "Pan-seared turkey breast steak."
    },
    "مرغ سوخاری در فر": {
        name: "Oven Fried Chicken",
        description: "Crispy chicken baked in the oven."
    },
    "رولت مرغ فلورنتينا": {
        name: "Chicken Florentine Roulade",
        description: "Chicken rolled with spinach and cheese."
    },
    "مرغ سوخاری تایلندی": {
        name: "Thai Fried Chicken",
        description: "Thai-style crispy fried chicken."
    },
    "کالباس مرغ 2": {
        name: "Homemade Chicken Ham",
        description: "Homemade chicken cold cut."
    },
    "كروكت مرغ 2": {
        name: "Chicken Croquette",
        description: "Breaded and fried chicken rolls."
    },
    "کالباس مرغ": {
        name: "Chicken Ham",
        description: "Homemade chicken ham."
    },
    "سینه مرغ با سس پرتقال": {
        name: "Chicken with Orange Sauce",
        description: "Chicken breast served with a tangy orange sauce."
    },
    "چیکن چاپ سوئی": {
        name: "Chicken Chop Suey",
        description: "Chinese-style stir-fry with chicken and vegetables."
    },
    "چیگن - مرغ سرخ شده": {
        name: "Fried Chicken Chips",
        description: "Fried chicken pieces served with chips."
    },
    "اسنک مرغ و لوبیا": {
        name: "Chicken & Bean Snack",
        description: "Toast snack with chicken and baked beans."
    },
    "بال مرغ با سس سیر": {
        name: "Garlic Chicken Wings",
        description: "Chicken wings with a garlic glaze."
    },
    "اسنک فیله مرغ": {
        name: "Chicken Fillet Snack",
        description: "Quick snack with chicken fillet."
    },
    "سينی بادمجان با مرغ": {
        name: "Eggplant & Chicken Tray",
        description: "Baked dish with layers of eggplant and chicken."
    },
    "سينه مرغ با پنير در فر": {
        name: "Cheesy Baked Chicken",
        description: "Chicken breast baked with cheese."
    },
    "مرغ قالبی با قارچ": {
        name: "Molded Chicken with Mushroom",
        description: "Chicken loaf with mushrooms."
    },
    "قارچ با خامه و مرغ": {
        name: "Creamy Mushroom Chicken",
        description: "Chicken and mushrooms in a cream sauce."
    },
    "فیله سینه مرغ با موتزارلا در سس گوجه": {
        name: "Chicken Mozzarella in Tomato Sauce",
        description: "Chicken breast with mozzarella cheese and tomato sauce."
    },
    "فیله پرک مرغ": {
        name: "Cornflake Chicken",
        description: "Chicken fillet coated in cornflakes."
    },
    "سینه مرغ با سس اسفناج و گردو": {
        name: "Chicken with Spinach & Walnut",
        description: "Chicken breast with a rich spinach and walnut sauce."
    },
    "ناگت مرغ تند": {
        name: "Spicy Chicken Nuggets",
        description: "Homemade spicy chicken nuggets."
    },
    "ران قالبی": {
        name: "Stuffed Chicken Thighs",
        description: "Boneless chicken thighs stuffed with vegetables."
    },
    "خوراک مرغ با سبزیجات مخصوص": {
        name: "Chicken with Special Veggies",
        description: "Chicken stew with mixed vegetables."
    },
    "خوراک سینه مرغ": {
        name: "Chicken Breast Stew",
        description: "Stew made with chicken breast."
    },
    "خوراک بلدرچین و سس لیمو": {
        name: "Quail with Lemon Sauce",
        description: "Roasted quail served with lemon sauce."
    },
    "خوراك مرغ با چاشني سماق": {
        name: "Sumac Chicken",
        description: "Chicken seasoned with sumac spice."
    },
    "یخنی عدس کلم": {
        name: "Lentil & Cabbage Stew",
        description: "A hearty stew with lentils, cabbage, and meat, served as a mash."
    },
    "سبزیجات کباب شده": {
        name: "Grilled Vegetables",
        description: "Assorted vegetables grilled to perfection."
    },
    "کباب مرغ با روغن کنجد و سالاد": {
        name: "Chicken Kebab with Sesame Oil",
        description: "Chicken kebab marinated in sesame oil served with salad."
    },
    "کباب کوبیده": {
        name: "Kebab Koobideh",
        description: "Classic Persian ground meat kebab."
    },
    "شیشلیک": {
        name: "Shishlik",
        description: "Grilled lamb chops."
    },
    "کباب برگ": {
        name: "Kebab Barg",
        description: "Grilled lamb fillet kebab."
    },
    "تاس‌کباب یک غذای اصیل ایرانی": {
        name: "Tas Kebab",
        description: "Traditional Persian meat and vegetable stew."
    },
    "کوبیده مرغ": {
        name: "Chicken Koobideh",
        description: "Ground chicken kebab."
    },
    "کباب با پنیر": {
        name: "Cheesy Kebab",
        description: "Kebab stuffed or topped with cheese."
    },
    "ترش شامی (كال شامی)": {
        name: "Sour Shami (Kal Shami)",
        description: "Sour meat patties made with unripe grapes."
    },
    "كال كباب": {
        name: "Kal Kebab",
        description: "Northern Iranian eggplant and pomegranate dip."
    },
    "کباب چوبی": {
        name: "Wooden Skewer Kebab",
        description: "Meat or chicken grilled on wooden skewers."
    },
    "جوجه کباب با سبزیجات": {
        name: "Chicken Kebab with Veggies",
        description: "Grilled chicken skewers with mixed vegetables."
    },
    "جوجه کباب با سس گوجه فرنگی": {
        name: "Chicken Kebab in Tomato Sauce",
        description: "Chicken kebab served with a rich tomato sauce."
    },
    "كباب‌ قارچ‌ و فلفل‌": {
        name: "Mushroom & Pepper Kebab",
        description: "Grilled skewers of mushrooms and bell peppers."
    },
    "کباب چوبی مدیترانه ای": {
        name: "Mediterranean Skewer Kebab",
        description: "Mediterranean style grilled skewers."
    },
    "کباب بلغاری": {
        name: "Bulgarian Kebab",
        description: "Bulgarian style grilled meat."
    },
    "طبخ چهار نوع كباب": {
        name: "Four Types of Kebab",
        description: "A platter or recipe for four different kebabs."
    },
    "كباب قارچ": {
        name: "Mushroom Kebab",
        description: "Grilled mushrooms."
    },
    "بریانی": {
        name: "Beryani",
        description: "Traditional Isfahan minced meat dish."
    },
    "کباب ترکی": {
        name: "Turkish Kebab (Doner)",
        description: "Turkish style roasted meat."
    },
    "کباب چنگه": {
        name: "Chenjeh Kebab",
        description: "Grilled chunks of marinated lamb."
    },
    "جوجه کباب بی استخوان": {
        name: "Boneless Chicken Kebab",
        description: "Grilled boneless chicken pieces."
    },
    "تازه کباب": {
        name: "Fresh Kebab",
        description: "Freshly made kebab dish."
    },
    "کباب غاز": {
        name: "Goose Kebab",
        description: "Grilled goose meat."
    },
    "کباب حسینی": {
        name: "Hosseini Kebab",
        description: "Kebab cooked on small wooden skewers in a pot."
    },
    "کباب جگر": {
        name: "Liver Kebab",
        description: "Grilled liver skewers."
    },
    "کباب کبک درسته": {
        name: "Whole Partridge Kebab",
        description: "Grilled whole partridge."
    },
    "کباب یونانی": {
        name: "Greek Kebab",
        description: "Greek style grilled meat."
    },
    "كباب تابه ای": {
        name: "Pan Kebab",
        description: "Kebab cooked in a pan."
    },
    "کباب کردن گوشت در فر": {
        name: "Oven Roasted Meat",
        description: "Meat roasted in the oven."
    },
    "جوجه کباب به سبک مراکشی": {
        name: "Moroccan Chicken Kebab",
        description: "Chicken kebab with Moroccan spices."
    },
    "استیک کوردن بلوی فرانسوی": {
        name: "Cordon Bleu Steak",
        description: "French style steak cordon bleu."
    },
    "برگری پر از سبزیجات": {
        name: "Veggie-Filled Burger",
        description: "Burger patty enriched with vegetables."
    },
    "گشنیز کباب": {
        name: "Coriander Kebab",
        description: "Kebab flavored with fresh coriander."
    },
    "استیک پارمیجانا": {
        name: "Steak Parmigiana",
        description: "Steak topped with parmesan and tomato sauce."
    },
    "کباب قلوه و جگر": {
        name: "Kidney & Liver Kebab",
        description: "Grilled skewers of kidney and liver."
    },
    "کباب تلخون (ساده و سریع)": {
        name: "Tarragon Kebab",
        description: "Quick kebab flavored with tarragon."
    },
    "کباب ترش": {
        name: "Sour Kebab (Kebab Torsh)",
        description: "Kebab marinated in pomegranate molasses and walnuts."
    },
    "low fat": {
        name: "Low Fat Kebab",
        description: "A low-fat kebab recipe."
    },
    "فیله ماهی کبابی": {
        name: "Grilled Fish Fillet",
        description: "Grilled fish fillets."
    },
    "چه چیزی را كباب می كنید؟": {
        name: "Grilling Tips",
        description: "Guide on what and how to grill."
    },
    "تاس كباب نخود فرنگی": {
        name: "Pea Tas Kebab",
        description: "Tas kebab stew with green peas."
    },
    "جوجه کباب با مرکبات": {
        name: "Citrus Chicken Kebab",
        description: "Chicken kebab marinated in citrus juices."
    },
    "جوجه کباب با سس ماست": {
        name: "Yogurt Chicken Kebab",
        description: "Chicken kebab marinated in yogurt sauce."
    },
    "كباب تركی خانگی": {
        name: "Homemade Turkish Kebab",
        description: "Homemade version of Turkish kebab."
    },
    "شنیسل‌ فیله‌": {
        name: "Fillet Schnitzel",
        description: "Breaded and fried meat fillet."
    },
    "شش کباب(کباب سیخی)": {
        name: "Shish Kebab",
        description: "Classic shish kebab on skewers."
    },
    "بره درسته": {
        name: "Whole Roasted Lamb",
        description: "Whole lamb roasted to perfection."
    },
    "کباب بلدرچین": {
        name: "Quail Kebab",
        description: "Grilled quail."
    },
    "کباب قرقاول": {
        name: "Pheasant Kebab",
        description: "Grilled pheasant."
    },
    "کباب گوشت چرخ کرده": {
        name: "Minced Meat Kebab",
        description: "Kebab made with seasoned minced meat."
    },
    "جوجه کباب درسته در فر": {
        name: "Whole Oven Chicken",
        description: "Whole chicken roasted in the oven."
    },
    "پسنده کباب": {
        name: "Pasandeh Kebab",
        description: "Special marinated kebab."
    },
    "کباب مرغابی": {
        name: "Duck Kebab",
        description: "Grilled duck meat."
    },
    "کتلت با مرغ": {
        name: "Chicken Cutlet",
        description: "Cutlets made with ground chicken."
    },
    "کتلت عربی": {
        name: "Arabic Cutlet",
        description: "Arabic style spiced cutlets."
    },
    "کوفته هویج": {
        name: "Carrot Meatball",
        description: "Meatballs made with carrots."
    },
    "كـوفته ريحـان": {
        name: "Basil Meatball",
        description: "Meatballs flavored with basil."
    },
    "کوفته قلقلی با مرغ": {
        name: "Chicken Meatballs",
        description: "Small meatballs made from chicken."
    },
    "کتلت پنیر": {
        name: "Cheese Cutlet",
        description: "Cutlets with cheese."
    },
    "کوفته هلو": {
        name: "Peach Meatball (Koofteh Holoo)",
        description: "Large meatballs, a traditional Shiraz dish."
    },
    "شامی": {
        name: "Shami",
        description: "Traditional meat and pulse patties."
    },
    "کتلت میگو": {
        name: "Shrimp Cutlet",
        description: "Cutlets made with shrimp."
    },
    "کوفته سبزی": {
        name: "Vegetable Meatball",
        description: "Meatballs with plenty of fresh herbs."
    },
    "کوفته هارپوت": {
        name: "Harput Meatball",
        description: "Traditional Harput style meatballs."
    },
    "کوفته ایزمیر": {
        name: "Izmir Meatball",
        description: "Izmir style meatballs in tomato sauce."
    },
    "مرغ پچارسکی": {
        name: "Pozharsky Cutlet",
        description: "Russian style chicken cutlets."
    },
    "کتلت سویا": {
        name: "Soy Cutlet",
        description: "Vegetarian cutlets made with soy protein."
    },
    "گوشت قلقلی با سبزیجات": {
        name: "Meatballs with Vegetables",
        description: "Meatballs served with a side of mixed vegetables."
    },
    "استیک با سبزیجات": {
        name: "Steak with Vegetables",
        description: "Juicy steak served with roasted vegetables."
    },
    "خوراک رنگی گوشت با برنج": {
        name: "Colorful Meat Stew with Rice",
        description: "A vibrant meat stew served with rice."
    },
    "وابیشکه": {
        name: "Vavishka",
        description: "Northern Iranian meat dish with tomatoes."
    },
    "نان و بريان": {
        name: "Bread & Beryan",
        description: "Traditional Isfahan dish served with bread."
    },
    "خوراک رز بادمجان": {
        name: "Eggplant Rose Stew",
        description: "Eggplant dish presented in a rose shape."
    },
    "خوراك گوشت": {
        name: "Meat Stew",
        description: "Simple and delicious meat stew."
    },
    "خوراك زبان با سس قارچ": {
        name: "Tongue with Mushroom Sauce",
        description: "Beef tongue served with creamy mushroom sauce."
    },
    "حمصی با گوشت": {
        name: "Hummus with Meat",
        description: "Hummus topped with spiced meat."
    },
    "تاس كباب نخود فرنگي": {
        name: "Pea Tas Kebab",
        description: "Tas kebab stew with green peas."
    },
    "پيده با گوشت": {
        name: "Meat Pide",
        description: "Turkish flatbread topped with minced meat."
    },
    "خوراک گوشت با سبزیجات": {
        name: "Meat & Vegetable Stew",
        description: "Stew made with meat and assorted vegetables."
    },
    "شنیسل جگر": {
        name: "Liver Schnitzel",
        description: "Breaded and fried liver slices."
    },
    "رول استیک": {
        name: "Steak Roll",
        description: "Rolled steak stuffed with vegetables or cheese."
    },
    "ژیگو": {
        name: "Gigot (Roast Leg of Lamb)",
        description: "Roast leg of lamb with garlic and herbs."
    },
    "فیله گوساله گریل شده روی سبزیجات": {
        name: "Grilled Veal Fillet on Veggies",
        description: "Grilled veal fillet served over a bed of vegetables."
    },
    "گوشت بریانی با سبزیجات": {
        name: "Beryani Meat with Veggies",
        description: "Beryani style meat served with vegetables."
    },
    "استیک آبدار": {
        name: "Juicy Steak",
        description: "Perfectly cooked juicy steak."
    },
    "رُست دنده خانگی": {
        name: "Homemade Rib Roast",
        description: "Roasted ribs prepared at home."
    },
    "خوراک ماهیچه و سبزیجات": {
        name: "Lamb Shank & Veggie Stew",
        description: "Lamb shank cooked with vegetables."
    },
    "پاي گوشت": {
        name: "Meat Pie",
        description: "Savory pie filled with seasoned meat."
    },
    "ویمپی - استیک چرخ کرده": {
        name: "Wimpy (Minced Steak)",
        description: "Steak made from minced meat."
    },
    "نودلز تن ماهی": {
        name: "Tuna Noodles",
        description: "Noodles served with tuna."
    },
    "نودلز گوشت": {
        name: "Meat Noodles",
        description: "Noodles served with meat sauce."
    },
    "تورندو با سس قارچ": {
        name: "Tournedos with Mushroom Sauce",
        description: "Beef tournedos served with mushroom sauce."
    },
    "خوراک ماهیچه": {
        name: "Lamb Shank Stew",
        description: "Traditional slow-cooked lamb shank."
    },
    "رتی فیله گوساله": {
        name: "Veal Fillet Roti",
        description: "Roast veal fillet."
    },
    "بیف استروگانوف(روسی)": {
        name: "Beef Stroganoff",
        description: "Classic Russian beef stroganoff."
    },
    "کلوچه گوشت": {
        name: "Meat Patty",
        description: "Savory meat patties."
    },
    "استیک با پوره فلفل دلمه ای": {
        name: "Steak with Bell Pepper Puree",
        description: "Steak served with a side of bell pepper puree."
    },
    "استیک نعناء": {
        name: "Mint Steak",
        description: "Steak flavored with mint."
    },
    "شنسل گوشت با پنیر گودا": {
        name: "Meat Schnitzel with Gouda",
        description: "Meat schnitzel topped with gouda cheese."
    },
    "ژیگوی بره همراه با سیب زمینی تنوری و گوجه فرنگی": {
        name: "Lamb Gigot with Baked Potatoes",
        description: "Roast lamb leg served with baked potatoes and tomatoes."
    },
    "ژيگو": {
        name: "Gigot",
        description: "Roast leg of lamb."
    },
    "نکاتي براي خوراک گوشتي": {
        name: "Meat Cooking Tips",
        description: "Tips and tricks for cooking meat dishes."
    },
    "سوفله سبزیجات": {
        name: "Vegetable Souffle",
        description: "Light and fluffy vegetable souffle."
    },
    "تارت قارچ و پياز": {
        name: "Mushroom & Onion Tart",
        description: "Savory tart with mushrooms and onions."
    },
    "سوفله موز": {
        name: "Banana Souffle",
        description: "Sweet banana souffle."
    },
    "تارت تره فرنگی و پیاز": {
        name: "Leek & Onion Tart",
        description: "Savory tart with leeks and onions."
    },
    "سوفله پنير": {
        name: "Cheese Souffle",
        description: "Classic cheese souffle."
    },
    "سوفله ژامبون": {
        name: "Ham Souffle",
        description: "Souffle made with ham."
    },
    "سوفله بادنجان": {
        name: "Eggplant Souffle",
        description: "Souffle made with eggplant."
    },
    "سوفله مرغ يا ماهي": {
        name: "Chicken or Fish Souffle",
        description: "Souffle made with chicken or fish."
    },
    "سوفله قارچ": {
        name: "Mushroom Souffle",
        description: "Souffle made with mushrooms."
    },
    "سوفله سيب زميني": {
        name: "Potato Souffle",
        description: "Souffle made with potatoes."
    },
    "سوفله سبزي و گل کلم": {
        name: "Vegetable & Cauliflower Souffle",
        description: "Souffle with mixed vegetables and cauliflower."
    },
    "سوفله اسفناج با ژامبون": {
        name: "Spinach & Ham Souffle",
        description: "Souffle with spinach and ham."
    },
    "فوندو": {
        name: "Fondue",
        description: "Classic cheese fondue."
    },
    "فوندوي گوجه فرنگي": {
        name: "Tomato Fondue",
        description: "Fondue with a tomato base."
    },
    "فوندو ترشک": {
        name: "Sorrel Fondue",
        description: "Fondue made with sorrel."
    },
    "فوندو بورگي ينون": {
        name: "Fondue Bourguignonne",
        description: "Meat fondue cooked in oil."
    },
    "سوفله شکلاتی": {
        name: "Chocolate Souffle",
        description: "Rich chocolate souffle."
    },
    "سوفله میوه جات": {
        name: "Fruit Souffle",
        description: "Souffle made with mixed fruits."
    },
    "سوفله کدو بادمجان": {
        name: "Zucchini & Eggplant Souffle",
        description: "Souffle with zucchini and eggplant."
    },
    "سوفله مرغ و قارچ": {
        name: "Chicken & Mushroom Souffle",
        description: "Souffle with chicken and mushrooms."
    },
    "نکاتي براي انواع سوفله": {
        name: "Souffle Tips",
        description: "Tips for making perfect souffles."
    },
    "موسکا": {
        name: "Moussaka",
        description: "Layered eggplant and meat dish."
    },
    "نان ناپلی": {
        name: "Napoli Bread",
        description: "Traditional bread from Naples."
    },
    "شیشلیک ایتالیایی": {
        name: "Italian Shishlik",
        description: "Italian style skewered meat."
    },
    "تورندو با سس ترخون و گشنیز": {
        name: "Tournedos with Tarragon",
        description: "Tournedos served with tarragon and coriander sauce."
    },
    "پانساروتی": {
        name: "Panzarotti",
        description: "Fried dough pockets filled with savory ingredients."
    },
    "كالزون مرغ و گوشت": {
        name: "Chicken & Meat Calzone",
        description: "Folded pizza filled with chicken and meat."
    },
    "دلمه کباب": {
        name: "Dolma Kebab",
        description: "Stuffed cabbage rolls with kebab filling."
    },
    "گراتن سيب ‌زمينی و ژامبون": {
        name: "Potato & Ham Gratin",
        description: "Gratin with potatoes and ham."
    },
    "کوسا با للین": {
        name: "Kousa with Yogurt Sauce",
        description: "Stuffed zucchini served with yogurt sauce."
    },
    "لازانیا": {
        name: "Lasagna",
        description: "Classic Italian lasagna with layers of meat and cheese."
    },
    "ماکارونی با سیر و سبزیجات": {
        name: "Macaroni with Garlic & Veggies",
        description: "Macaroni pasta cooked with garlic and mixed vegetables."
    },
    "اسپاگتی با سس بلونگ": {
        name: "Spaghetti Bolognese",
        description: "Spaghetti served with a rich meat-based bolognese sauce."
    },
    "اسپاگتی ایتالیایی": {
        name: "Italian Spaghetti",
        description: "Traditional Italian style spaghetti."
    },
    "تالیاتلی پنیردار با کلم بروکلی و ژامبون": {
        name: "Cheesy Tagliatelle with Broccoli & Ham",
        description: "Tagliatelle pasta with cheese sauce, broccoli, and ham."
    },
    "ماكارونی با سس بشامل": {
        name: "Macaroni with Bechamel",
        description: "Macaroni served with creamy bechamel sauce."
    },
    "ماکارونی سبزیجات با سس نعناع و کاری": {
        name: "Veggie Macaroni with Mint Curry",
        description: "Vegetable macaroni with a unique mint and curry sauce."
    },
    "خوراک لازانیا": {
        name: "Lasagna Stew",
        description: "Deconstructed lasagna served as a stew."
    },
    "اسپاگتی با گوشت": {
        name: "Spaghetti with Meat",
        description: "Spaghetti served with savory meat sauce."
    },
    "پستای پنیر( زمان پخت: ۴۰دقیقه )": {
        name: "Cheese Pasta",
        description: "Pasta baked with plenty of cheese."
    },
    "ماکارونی با سس باقلا": {
        name: "Macaroni with Fava Bean Sauce",
        description: "Macaroni served with a sauce made from fava beans."
    },
    "پّستا با گوجه فرنگی ( زمان پخت: ۳۰ دقیقه )": {
        name: "Tomato Pasta",
        description: "Simple and delicious pasta with tomato sauce."
    },
    "اسپاگتی با پنیر": {
        name: "Cheesy Spaghetti",
        description: "Spaghetti tossed with melted cheese."
    },
    "نان اسپاگتی": {
        name: "Spaghetti Bread",
        description: "Creative dish combining spaghetti and bread dough."
    },
    "لازانیا و کدو": {
        name: "Lasagna & Zucchini",
        description: "Lasagna layered with zucchini slices."
    },
    "ماکارونی و سس سفید": {
        name: "Macaroni with White Sauce",
        description: "Macaroni served with a creamy white sauce."
    },
    "پاستا با قارچ‌ و ریحان‌": {
        name: "Pasta with Mushroom & Basil",
        description: "Pasta tossed with sautéed mushrooms and fresh basil."
    },
    "اسپاگتی‌ با قارچ‌": {
        name: "Spaghetti with Mushrooms",
        description: "Spaghetti served with mushroom sauce."
    },
    "اسپاگتی‌ بولونیایی‌": {
        name: "Spaghetti Bolognese",
        description: "Classic spaghetti with meat sauce."
    },
    "ماكارانی‌ با قارچ‌ و ژامبون‌ مرغ‌": {
        name: "Macaroni with Mushroom & Chicken Ham",
        description: "Macaroni with mushrooms and chicken ham."
    },
    "ماكارونی‌ در سس‌ پنیر و گوجه‌ فرنگی‌": {
        name: "Macaroni in Cheese & Tomato Sauce",
        description: "Macaroni cooked in a blend of cheese and tomato sauce."
    },
    "لازانیای سبزیجات": {
        name: "Vegetable Lasagna",
        description: "Lasagna filled with assorted vegetables."
    },
    "اسپاگتی‌ یونانی‌": {
        name: "Greek Spaghetti",
        description: "Spaghetti prepared with Greek flavors."
    },
    "ماكارونی‌ با كشمش‌ و حبوبات‌": {
        name: "Macaroni with Raisins & Legumes",
        description: "Unique macaroni dish with raisins and mixed legumes."
    },
    "ماكارونی‌ با سوسیس‌ و زیتون‌": {
        name: "Macaroni with Sausage & Olives",
        description: "Macaroni served with sliced sausage and olives."
    },
    "پاستا با قارچ و سس خامه برای ۴ نفر": {
        name: "Creamy Mushroom Pasta",
        description: "Pasta with a rich creamy mushroom sauce."
    },
    "خوراك‌ ماكارونی‌": {
        name: "Macaroni Stew",
        description: "Hearty stew made with macaroni."
    },
    "چند نوع ماكارونی": {
        name: "Assorted Macaroni",
        description: "A variety of macaroni shapes and sauces."
    },
    "ساده و سریع با ماكارونی": {
        name: "Quick & Simple Macaroni",
        description: "A fast and easy macaroni recipe."
    },
    "ماکارونی با کدو سبز": {
        name: "Macaroni with Zucchini",
        description: "Macaroni cooked with fresh zucchini."
    },
    "گوشت قلقلی با اسپاگتی": {
        name: "Meatballs with Spaghetti",
        description: "Classic spaghetti and meatballs."
    },
    "گراتن ماکارونی": {
        name: "Macaroni Gratin",
        description: "Baked macaroni with cheese and white sauce."
    },
    "خمیر راویولی": {
        name: "Ravioli Dough",
        description: "Homemade dough for making ravioli."
    },
    "ماکارونی کالباس و خامه": {
        name: "Macaroni with Ham & Cream",
        description: "Creamy macaroni with chopped ham."
    },
    "لازانیا نوع اول": {
        name: "Lasagna (Variation 1)",
        description: "A variation of the classic lasagna recipe."
    },
    "لازانیا نوع دوم": {
        name: "Lasagna (Variation 2)",
        description: "Another delicious variation of lasagna."
    },
    "راویولی": {
        name: "Ravioli",
        description: "Stuffed pasta pockets."
    },
    "کانلونی": {
        name: "Cannelloni",
        description: "Large pasta tubes filled with meat or cheese."
    },
    "اسپاگتی با تخم مرغ": {
        name: "Spaghetti with Eggs",
        description: "Spaghetti stir-fried with eggs."
    },
    "نکاتی برای اسپاگتی یا ماکارونی": {
        name: "Spaghetti & Macaroni Tips",
        description: "Tips for cooking perfect pasta."
    },
    "لازانیای بادمجان": {
        name: "Eggplant Lasagna",
        description: "Lasagna using eggplant slices instead of pasta."
    },
    "گل كلم پلـو": {
        name: "Cauliflower Rice",
        description: "Rice cooked with cauliflower florets."
    },
    "ته ‌چين آلو اسفناج و مرغ": {
        name: "Plum Spinach & Chicken Tahchin",
        description: "Layered rice cake with plums, spinach, and chicken."
    },
    "کاهو پلو": {
        name: "Lettuce Rice",
        description: "Rice dish cooked with lettuce."
    },
    "ته چین سبزی پلو ترش": {
        name: "Sour Herb Tahchin",
        description: "Sour herb rice cake."
    },
    "کلم پلو کلم قرمز": {
        name: "Red Cabbage Rice",
        description: "Rice cooked with red cabbage."
    },
    "عدس پلو مخصوص": {
        name: "Special Lentil Rice",
        description: "A special version of lentil rice."
    },
    "پلو یونانی": {
        name: "Greek Rice",
        description: "Greek style rice dish."
    },
    "پلاف": {
        name: "Pilaf",
        description: "Classic pilaf rice."
    },
    "رشته پلو با گوشت": {
        name: "Reshteh Polo with Meat",
        description: "Noodle rice served with meat."
    },
    "دمی بلغور": {
        name: "Bulgur Dami",
        description: "Steamed bulgur dish."
    },
    "دمی گشنیز و اسفناج": {
        name: "Coriander & Spinach Dami",
        description: "Rice steamed with fresh coriander and spinach."
    },
    "برنج شیرازی": {
        name: "Shirazi Rice",
        description: "Traditional rice dish from Shiraz."
    },
    "فلفل پلو با تخم مرغ": {
        name: "Pepper Rice with Eggs",
        description: "Rice cooked with bell peppers and served with eggs."
    },
    "دمپختک": {
        name: "Dampokhtak",
        description: "Turmeric rice with beans."
    },
    "پلو نخود فرنگی": {
        name: "Pea Rice",
        description: "Rice cooked with green peas."
    },
    "پلوی استانبولی": {
        name: "Estamboli Polo",
        description: "Tomato rice with potatoes and meat."
    },
    "پلو شوشتری": {
        name: "Shoushtari Polo",
        description: "Rice dish with black-eyed peas and dill."
    },
    "لوبیا پلو با فیله مرغ": {
        name: "Green Bean Rice with Chicken Fillet",
        description: "Green bean rice served with chicken fillets."
    },
    "کشمش پلو اردبیلی": {
        name: "Ardebil Raisin Rice",
        description: "Raisin rice dish from Ardebil."
    },
    "پلو و سبزیجات": {
        name: "Rice & Vegetables",
        description: "Rice served with mixed vegetables."
    },
    "ته دیگ ته چین": {
        name: "Tahchin Tahdig",
        description: "Crispy saffron rice cake bottom."
    },
    "ته چین دو رنگ": {
        name: "Two-Color Tahchin",
        description: "Tahchin with two layers of colors."
    },
    "دمی یارما": {
        name: "Yarma Dami",
        description: "Traditional groat dish."
    },
    "کته تند": {
        name: "Spicy Kateh",
        description: "Spicy steamed rice."
    },
    "پلو با نخود": {
        name: "Chickpea Rice",
        description: "Rice cooked with chickpeas."
    },
    "پلو مخلوط": {
        name: "Mixed Rice",
        description: "Rice mixed with various ingredients."
    },
    "استامبولی پلو": {
        name: "Estamboli Polo",
        description: "Tomato rice with green beans or potatoes."
    },
    "استانبولی پلو": {
        name: "Estamboli Polo",
        description: "Tomato rice with green beans or potatoes."
    },
    "اسلامبولی پلو": {
        name: "Estamboli Polo",
        description: "Tomato rice with green beans or potatoes."
    },
    "برنج سبز": {
        name: "Green Rice",
        description: "Rice cooked with plenty of herbs."
    },
    "برنج با سبزيجات به روش چيني": {
        name: "Chinese Veggie Rice",
        description: "Fried rice with vegetables Chinese style."
    },
    "کشمش پلو": {
        name: "Raisin Rice",
        description: "Rice cooked with sweet raisins."
    },
    "کاری پلوی زعفرانی": {
        name: "Saffron Curry Rice",
        description: "Saffron rice flavored with curry."
    },
    "نثار پلو": {
        name: "Nesar Polo",
        description: "Qazvin specialty rice with barberries and nuts."
    },
    "مرغ پلو با سبزیجات": {
        name: "Chicken & Veggie Rice",
        description: "Rice cooked with chicken and vegetables."
    },
    "لوبیا پلو با سبزی": {
        name: "Herbed Green Bean Rice",
        description: "Green bean rice with aromatic herbs."
    },
    "كله پاچه پلو": {
        name: "Kaleh Pacheh Polo",
        description: "Rice served with sheep's head and trotters broth."
    },
    "شير پلو": {
        name: "Milk Rice",
        description: "Rice cooked in milk (Shir Berenj)."
    },
    "ساردی پلو": {
        name: "Sardi Polo",
        description: "Traditional rice dish."
    },
    "دمی گوجه فرنگی": {
        name: "Tomato Dami",
        description: "Rice steamed with tomatoes."
    },
    "چيكن پلو": {
        name: "Chicken Polo",
        description: "Rice dish with chicken."
    },
    "چلو گوشت سمنانی": {
        name: "Semnani Meat Rice",
        description: "Rice with meat, Semnan style."
    },
    "ته چین شیرازی": {
        name: "Shirazi Tahchin",
        description: "Tahchin style from Shiraz."
    },
    "ته چین ساده و اسفناج قالبی": {
        name: "Spinach Tahchin Mold",
        description: "Molded tahchin with spinach."
    },
    "ته چين مرغ و بادمجان": {
        name: "Chicken & Eggplant Tahchin",
        description: "Tahchin layered with chicken and eggplant."
    },
    "ته چين زرشك و گردو": {
        name: "Barberry & Walnut Tahchin",
        description: "Tahchin with barberries and walnuts."
    },
    "ته چين آلبالو": {
        name: "Sour Cherry Tahchin",
        description: "Tahchin made with sour cherries."
    },
    "پلوی قارچ و مرغ": {
        name: "Mushroom & Chicken Rice",
        description: "Rice cooked with mushrooms and chicken."
    },
    "رشته پلو": {
        name: "Reshteh Polo",
        description: "Rice with toasted noodles."
    },
    "نخود پلو": {
        name: "Chickpea Rice",
        description: "Rice with chickpeas."
    },
    "پلو افرانای فصل": {
        name: "Seasonal Saffron Rice",
        description: "Saffron rice with seasonal ingredients."
    },
    "شوید باقلا پلو با ماهیچه": {
        name: "Dill & Fava Bean Rice with Shank",
        description: "Classic rice with dill, fava beans, and lamb shank."
    },
    "برنج رنگی با پنیر": {
        name: "Colorful Cheesy Rice",
        description: "Colorful rice topped with cheese."
    },
    "پلو اندونزی و کباب": {
        name: "Indonesian Rice & Kebab",
        description: "Indonesian style rice served with kebab."
    },
    "پلو مکزیکی": {
        name: "Mexican Rice",
        description: "Spicy Mexican style rice."
    },
    "نخودپلوی مکزیکی": {
        name: "Mexican Chickpea Rice",
        description: "Mexican style rice with chickpeas."
    },
    "پلوی ساده با طعم هل و میخک": {
        name: "Cardamom & Clove Rice",
        description: "Simple rice flavored with cardamom and cloves."
    },
    "شنگ پلو": {
        name: "Sheng Polo",
        description: "Rice cooked with Sheng (a wild herb)."
    },
    "باقالاپلوی پاکستانی و هندی": {
        name: "Pakistani/Indian Fava Rice",
        description: "Spicy fava bean rice."
    },
    "پلوی چشم‌بلبلی با کوفته ریزه": {
        name: "Black-Eyed Pea Rice with Meatballs",
        description: "Rice with black-eyed peas and small meatballs."
    },
    "ته‌چین اسفناج": {
        name: "Spinach Tahchin",
        description: "Saffron rice cake with spinach."
    },
    "ته چین، غذای ایرانی": {
        name: "Tahchin (Persian Rice Cake)",
        description: "Classic Persian saffron rice cake."
    },
    "دمی عدس و هویج": {
        name: "Lentil & Carrot Dami",
        description: "Rice steamed with lentils and carrots."
    },
    "فلفل‌پلو با مرغ": {
        name: "Pepper Rice with Chicken",
        description: "Rice with bell peppers and chicken."
    },
    "چلوکباب ترخونی": {
        name: "Tarragon Kebab Rice",
        description: "Rice served with tarragon-flavored kebab."
    },
    "عدس پلو با سس مرغ": {
        name: "Lentil Rice with Chicken Sauce",
        description: "Lentil rice served with chicken sauce."
    },
    "اسفناج پلو": {
        name: "Spinach Rice",
        description: "Rice cooked with spinach."
    },
    "پلوی لوبیا قرمز": {
        name: "Red Bean Rice",
        description: "Rice cooked with red kidney beans."
    },
    "پلو قبولی": {
        name: "Ghabouli Polo",
        description: "Traditional rice dish with meat and chickpeas."
    },
    "دمی بادمجان": {
        name: "Eggplant Dami",
        description: "Rice steamed with eggplant."
    },
    "اسفناج پلوی هندی": {
        name: "Indian Spinach Rice",
        description: "Spicy Indian style spinach rice."
    },
    "رشته‌پلو با لوبیا چشم‌بلبلی": {
        name: "Reshteh Polo with Black-Eyed Peas",
        description: "Noodle rice with black-eyed peas."
    },
    "هویج پلو": {
        name: "Carrot Rice",
        description: "Sweet and savory rice with carrots."
    },
    "ته‌چین گوشت و بادمجان": {
        name: "Meat & Eggplant Tahchin",
        description: "Tahchin with meat and eggplant layers."
    },
    "والک پلو": {
        name: "Valak Polo",
        description: "Rice cooked with Valak (wild mountain leek)."
    },
    "کلم پلو": {
        name: "Cabbage Rice",
        description: "Rice cooked with cabbage and herbs."
    },
    "شیرازی‌ پلو": {
        name: "Shirazi Polo",
        description: "Rice dish from Shiraz."
    },
    "ته چین مرغ در مایتابه": {
        name: "Pan Chicken Tahchin",
        description: "Chicken tahchin cooked in a pan."
    },
    "د‌م پختک باقلا خشک زرد": {
        name: "Yellow Fava Bean Dampokhtak",
        description: "Turmeric rice with dried yellow fava beans."
    },
    "غذای شب‌های عروسی": {
        name: "Wedding Night Feast",
        description: "Traditional celebratory rice dish."
    },
    "مرصع پلو": {
        name: "Jeweled Rice (Morasa Polo)",
        description: "Rice topped with nuts and dried fruits like jewels."
    },
    "سبزی پلو": {
        name: "Herb Rice",
        description: "Rice cooked with fresh herbs."
    },
    "لوبیا پلو": {
        name: "Green Bean Rice",
        description: "Rice with green beans and meat."
    },
    "عدس پلو": {
        name: "Lentil Rice",
        description: "Rice with lentils and raisins."
    },
    "شکر پلو": {
        name: "Sugar Rice",
        description: "Sweet rice dish from Shiraz."
    },
    "ته چین مرغ یا بره": {
        name: "Chicken or Lamb Tahchin",
        description: "Tahchin made with chicken or lamb."
    },
    "پلو ( یا چلو)": {
        name: "Polo (Rice)",
        description: "Plain steamed rice."
    },
    "سوتی پلو": {
        name: "Sooti Polo",
        description: "Traditional rice dish."
    },
    "عدس پلو با قارچ": {
        name: "Lentil Rice with Mushrooms",
        description: "Lentil rice with sautéed mushrooms."
    },
    "زرشک پلو با مرغ": {
        name: "Barberry Rice with Chicken",
        description: "Classic saffron rice with barberries and chicken."
    },
    "کلم پلوی شیرازی": {
        name: "Shirazi Cabbage Rice",
        description: "Shirazi style cabbage rice with meatballs."
    },
    "پلومرغ سرخ شده": {
        name: "Fried Chicken Rice",
        description: "Rice served with fried chicken."
    },
    "میگو پلو": {
        name: "Shrimp Rice",
        description: "Rice cooked with shrimp."
    },
    "آلبالو پلو": {
        name: "Sour Cherry Rice",
        description: "Sweet and sour rice with sour cherries."
    },
    "سبزی‌ پلو با ماهی": {
        name: "Herb Rice with Fish",
        description: "Traditional New Year's dish."
    },
    "باقلا پلو": {
        name: "Fava Bean Rice",
        description: "Rice with fava beans and dill."
    },
    "کته": {
        name: "Kateh",
        description: "Simple steamed rice."
    },
    "كوكوی كدو با هويج": {
        name: "Zucchini & Carrot Kookoo",
        description: "Frittata made with zucchini and carrots."
    },
    "رولهای برنجی": {
        name: "Rice Rolls",
        description: "Rolls filled with rice mixture."
    },
    "دلمه فلفل و بادمجان": {
        name: "Stuffed Pepper & Eggplant",
        description: "Peppers and eggplants stuffed with rice and meat."
    },
    "دلمه فلفل سبز": {
        name: "Stuffed Green Pepper",
        description: "Green peppers stuffed with savory filling."
    },
    "املت ایتالیایی": {
        name: "Italian Omelet",
        description: "A delicious and hearty omelet with mushrooms, zucchini, and corn.",
        ingredients: [
            "1 Onion, chopped",
            "Mushrooms, chopped (as desired)",
            "Zucchini, chopped (as desired)",
            "Corn kernels (as desired)",
            "Bread crumbs",
            "5 Eggs, beaten",
            "Pizza Cheese",
            "Salt and Pepper"
        ],
        instructions: [
            "Sauté the onion, zucchini, and mushrooms in a little oil, then add the corn.",
            "Add the sautéed mixture to the beaten eggs, cheese, pepper, salt, and bread crumbs. The mixture should be thick.",
            "Pour the mixture into a pan with butter and cook both sides like a Kookoo (frittata)."
        ]
    },

    "دلمه سه رنگ": {
        name: "Three-Color Dolma",
        description: "Stuffed peppers in three colors."
    },
    "کوکو بادمجان کبابی": {
        name: "Grilled Eggplant Kookoo",
        description: "Frittata made with grilled eggplant."
    },
    "کیک سیب زمینی": {
        name: "Potato Cake",
        description: "Savory cake made with potatoes."
    },
    "دلمه مرغ و برنج": {
        name: "Chicken & Rice Dolma",
        description: "Dolma filled with chicken and rice."
    },
    "دلمه برگ مو": {
        name: "Stuffed Grape Leaves",
        description: "Classic grape leaves stuffed with rice and herbs."
    },
    "دلمه آرتیشو": {
        name: "Stuffed Artichoke",
        description: "Artichokes stuffed with savory filling."
    },
    "کوکو سیب زمینی با پنیر": {
        name: "Cheesy Potato Kookoo",
        description: "Potato frittata with cheese."
    },
    "کوکوی کالباس": {
        name: "Sausage Kookoo",
        description: "Frittata made with sausage."
    },
    "کوکوی کدوسبز": {
        name: "Zucchini Kookoo",
        description: "Frittata made with fresh zucchini."
    },
    "کوکو میگو با گشنیز و جعفری": {
        name: "Shrimp Kookoo with Herbs",
        description: "Shrimp frittata with coriander and parsley."
    },
    "دلمه در مایکروفر": {
        name: "Microwave Dolma",
        description: "Dolma cooked in a microwave."
    },
    "د‌لمه کد‌و": {
        name: "Stuffed Zucchini",
        description: "Zucchini stuffed with savory filling."
    },
    "کوکوی سبزیجات": {
        name: "Vegetable Kookoo",
        description: "Frittata made with mixed vegetables."
    },
    "کوکوی خاویار ماهی سفید": {
        name: "Fish Roe Kookoo",
        description: "Frittata made with fish roe."
    },
    "کوکوی باقالا سبز": {
        name: "Fava Bean Kookoo",
        description: "Frittata made with fresh fava beans."
    },
    "کوکوی سیب زمینی با تن ماهی": {
        name: "Potato & Tuna Kookoo",
        description: "Potato frittata with tuna fish."
    },
    "دلمه فلفل": {
        name: "Stuffed Pepper",
        description: "Bell peppers stuffed with meat and rice."
    },
    "دلمه برگ مو در سواحل مدیترانه": {
        name: "Mediterranean Grape Leaves",
        description: "Grape leaves stuffed Mediterranean style."
    },
    "کوکوی شوید": {
        name: "Dill Kookoo",
        description: "Frittata made with plenty of fresh dill."
    },
    "کوکو رنگی": {
        name: "Colorful Kookoo",
        description: "Frittata with colorful vegetables."
    },
    "کوکوی بامیه": {
        name: "Okra Kookoo",
        description: "Frittata made with okra."
    },
    "کوکوی بادمجان کبابی": {
        name: "Grilled Eggplant Kookoo",
        description: "Frittata with grilled eggplant."
    },
    "کوکوی ماهی": {
        name: "Fish Kookoo",
        description: "Frittata made with fish."
    },
    "کوکوی گل کلم": {
        name: "Cauliflower Kookoo",
        description: "Frittata made with cauliflower."
    },
    "کوکوی ماهی شیر": {
        name: "Seer Fish Kookoo",
        description: "Frittata made with Seer fish."
    },
    "ناگت مرغ": {
        name: "Chicken Nugget",
        description: "Homemade chicken nuggets."
    },
    "کوکوی اسفناج با پنیر پیتزا": {
        name: "Spinach & Cheese Kookoo",
        description: "Spinach frittata topped with pizza cheese."
    },
    "کوکوی اسفناج و سبزیجات معطر": {
        name: "Spinach & Herb Kookoo",
        description: "Frittata with spinach and aromatic herbs."
    },
    "کوکوی کنجد": {
        name: "Sesame Kookoo",
        description: "Frittata with sesame seeds."
    },
    "کوکوی مرغ": {
        name: "Chicken Kookoo",
        description: "Frittata made with minced chicken."
    },
    "کوکوی تره": {
        name: "Leek Kookoo",
        description: "Frittata made with fresh leeks."
    },
    "دلمه کلم با گوشت": {
        name: "Stuffed Cabbage with Meat",
        description: "Cabbage rolls filled with meat and rice."
    },
    "کوکوی گردو": {
        name: "Walnut Kookoo",
        description: "Frittata made with walnuts."
    },
    "کوکوی مخلوط": {
        name: "Mixed Kookoo",
        description: "Frittata with a mix of ingredients."
    },
    "کوکوماست": {
        name: "Yogurt Kookoo",
        description: "Unique frittata made with yogurt."
    },
    "کوکوی سبزی‌های زمستانی": {
        name: "Winter Veggie Kookoo",
        description: "Frittata made with winter vegetables."
    },
    "دلمه با ماکارونی": {
        name: "Macaroni Dolma",
        description: "Vegetables stuffed with macaroni mixture."
    },
    "فلافل خانگی": {
        name: "Homemade Falafel",
        description: "Crispy homemade falafel balls."
    },
    "کوکوی بادمجان": {
        name: "Eggplant Kookoo",
        description: "Frittata made with eggplant."
    },
    "کوکوی اسفناج": {
        name: "Spinach Kookoo",
        description: "Frittata made with fresh spinach."
    },
    "کوکو سیب زمینی": {
        name: "Potato Kookoo",
        description: "Classic potato frittata (Kookoo Sibzamini)."
    },
    "کوکوی کدو": {
        name: "Zucchini Kookoo",
        description: "Frittata made with zucchini."
    },
    "دلمه گوجه فرنگی": {
        name: "Stuffed Tomato",
        description: "Tomatoes stuffed with savory filling."
    },
    "کوکوی سیب زمینی سه رنگ": {
        name: "Three-Color Potato Kookoo",
        description: "Potato frittata with three colors."
    },
    "دلمه بادمجان": {
        name: "Stuffed Eggplant",
        description: "Eggplants stuffed with meat and rice."
    },
    "دلمه با فیله مرغ": {
        name: "Chicken Fillet Dolma",
        description: "Dolma made with chicken fillet."
    },
    "کوکوی تن ماهی": {
        name: "Tuna Kookoo",
        description: "Frittata made with tuna fish."
    },
    "کوکوی گوشت": {
        name: "Meat Kookoo",
        description: "Frittata made with ground meat."
    },
    "دلمه کرفس": {
        name: "Stuffed Celery",
        description: "Celery stalks stuffed with filling."
    },
    "دلمه برگ مو به روش یونانی": {
        name: "Greek Grape Leaves",
        description: "Grape leaves stuffed Greek style."
    },
    "دلمه ماهی با سس پنیر": {
        name: "Fish Dolma with Cheese Sauce",
        description: "Stuffed fish served with cheese sauce."
    },
    "كوكوی قارچ": {
        name: "Mushroom Kookoo",
        description: "Frittata made with mushrooms."
    },
    "كوكوسبزی": {
        name: "Herb Kookoo (Kookoo Sabzi)",
        description: "Classic Persian herb frittata."
    },
    "دلمه فلفل": {
        name: "Stuffed Pepper",
        description: "Peppers stuffed with savory filling."
    },
    "كوكوی دو رنگ": {
        name: "Two-Color Kookoo",
        description: "Layered frittata with two colors."
    },
    "دلمه با نان لواش (دست پیچ )": {
        name: "Lavash Bread Dolma",
        description: "Filling wrapped in Lavash bread."
    },
    "کوکوی لوبیا سبز": {
        name: "Green Bean Kookoo",
        description: "Frittata made with green beans."
    },
    "کوکوی پیازچه": {
        name: "Scallion Kookoo",
        description: "Frittata made with scallions."
    },
    "نکاتی برای انواع دلمه و کوکو": {
        name: "Tips for Dolma & Kookoo",
        description: "Cooking tips for stuffed vegetables and frittatas."
    },
    "دلمه بادمجان تركی": {
        name: "Turkish Stuffed Eggplant",
        description: "Turkish style stuffed eggplant."
    },
    "دلمه برگ مو بدون گوشت": {
        name: "Vegetarian Grape Leaves",
        description: "Stuffed grape leaves without meat."
    },
    "دلمه بره": {
        name: "Lamb Dolma",
        description: "Dolma filled with lamb meat."
    },
    "دلمه پیاز": {
        name: "Stuffed Onion",
        description: "Onions stuffed with savory filling."
    },
    "كوكو سیب زمینی با پنیر چدار": {
        name: "Cheddar Potato Kookoo",
        description: "Potato frittata with cheddar cheese."
    },
    "كوكو سیب زمینی با سیب زمینی نگینی": {
        name: "Diced Potato Kookoo",
        description: "Frittata made with diced potatoes."
    },
    "كوكوی سیب زمینی با كلم": {
        name: "Potato & Cabbage Kookoo",
        description: "Frittata made with potato and cabbage."
    },
    "كوكوی سیب زمینی و اسفناج": {
        name: "Potato & Spinach Kookoo",
        description: "Frittata made with potato and spinach."
    },
    "دلمه کلم با مرغ": {
        name: "Chicken Stuffed Cabbage",
        description: "Cabbage rolls filled with chicken."
    },
    "کوکوی قارچ و برنج": {
        name: "Mushroom & Rice Kookoo",
        description: "Frittata made with mushroom and rice."
    },
    "سوپ اسفناج": {
        name: "Spinach Soup",
        description: "Healthy soup made with fresh spinach."
    },
    "سوپ کدو تنبل": {
        name: "Pumpkin Soup",
        description: "Creamy soup made with pumpkin."
    },
    "مینسترون": {
        name: "Minestrone",
        description: "Classic Italian vegetable soup."
    },
    "سوپ پیازچه": {
        name: "Scallion Soup",
        description: "Soup made with fresh scallions."
    },
    "سوپ غلات": {
        name: "Grain Soup",
        description: "Hearty soup made with mixed grains."
    },
    "سوپ شیر با سبزبجات": {
        name: "Milk & Vegetable Soup",
        description: "Creamy milk soup with vegetables."
    },
    "سوپ بادنجان": {
        name: "Eggplant Soup",
        description: "Soup made with roasted eggplant."
    },
    "سوپ کدو سبز با پیاز": {
        name: "Zucchini & Onion Soup",
        description: "Soup made with zucchini and onions."
    },
    "سوپ دال عدس": {
        name: "Dal Lentil Soup",
        description: "Spicy red lentil soup."
    },
    "سوپ ماکارونی فرمی": {
        name: "Pasta Shape Soup",
        description: "Soup with shaped pasta."
    },
    "سوپ بلال": {
        name: "Corn Soup",
        description: "Soup made with fresh corn."
    },
    "سوپ عدس و پاستا": {
        name: "Lentil & Pasta Soup",
        description: "Hearty soup with lentils and pasta."
    },
    "کرم سوپ قارچ": {
        name: "Cream of Mushroom Soup",
        description: "Rich and creamy mushroom soup."
    },
    "ويشي سوا": {
        name: "Vichyssoise",
        description: "Cold leek and potato soup."
    },
    "سوپ سیر": {
        name: "Garlic Soup",
        description: "Soup with a rich garlic flavor."
    },
    "مينسترونی": {
        name: "Minestrone",
        description: "Classic Italian vegetable soup."
    },
    "سوپ برش روسی": {
        name: "Russian Borscht",
        description: "Beetroot soup Russian style."
    },
    "سوپ کلم و هویج": {
        name: "Cabbage & Carrot Soup",
        description: "Soup made with cabbage and carrots."
    },
    "سوپ برنج": {
        name: "Rice Soup",
        description: "Simple soup with rice."
    },
    "سوپ تره فرنگی - 2": {
        name: "Leek Soup (Variation)",
        description: "Another variation of leek soup."
    },
    "سوپ تخم مرغ": {
        name: "Egg Soup",
        description: "Soup with egg ribbons."
    },
    "سوپ با نخود فرنگی": {
        name: "Pea Soup",
        description: "Soup made with green peas."
    },
    "سوپ سوژ": {
        name: "Sooj Soup",
        description: "Traditional soup."
    },
    "سوپ لوبیا": {
        name: "Bean Soup",
        description: "Hearty bean soup."
    },
    "سوپ ریحان و گوجه‌فرنگی": {
        name: "Tomato Basil Soup",
        description: "Classic tomato soup with fresh basil."
    },
    "سوپ گوجه فرنگی با بادمجان": {
        name: "Tomato & Eggplant Soup",
        description: "Tomato soup with eggplant chunks."
    },
    "سوپ گوشت و سیب زمینی": {
        name: "Meat & Potato Soup",
        description: "Hearty soup with meat and potatoes."
    },
    "سوپ ذرت با مرغ": {
        name: "Chicken Corn Soup",
        description: "Soup with chicken and sweet corn."
    },
    "سوپ چینی": {
        name: "Chinese Soup",
        description: "Chinese style soup."
    },
    "سوپ برکلی": {
        name: "Broccoli Soup",
        description: "Creamy broccoli soup."
    },
    "سوپ شیر و عدس": {
        name: "Milk & Lentil Soup",
        description: "Creamy soup with lentils."
    },
    "سوپ تند سبزیجات": {
        name: "Spicy Vegetable Soup",
        description: "Spicy soup with mixed vegetables."
    },
    "سوپ بروکلی و مرغ": {
        name: "Chicken & Broccoli Soup",
        description: "Soup with chicken and broccoli."
    },
    "سوپ ماکارونی و لوبیا چشم بلبلی": {
        name: "Pasta & Black-Eyed Pea Soup",
        description: "Soup with pasta and black-eyed peas."
    },
    "سوپ رژیمی": {
        name: "Diet Soup",
        description: "Low-calorie vegetable soup."
    },
    "سوپ شیر": {
        name: "Milk Soup (Soup-e Shir)",
        description: "Classic Persian creamy soup with barley and milk."
    },
    "سوپ ماهیچه": {
        name: "Muscle Soup",
        description: "Nutritious soup made with muscle meat broth."
    },
    "سوپ کدو سبز": {
        name: "Zucchini Soup",
        description: "Light soup made with zucchini."
    },
    "سوپ ماست": {
        name: "Yogurt Soup",
        description: "Soup made with yogurt and herbs."
    },
    "سوپ سیب زمینی و فلفل دلمه": {
        name: "Potato & Bell Pepper Soup",
        description: "Soup with potatoes and bell peppers."
    },
    "سوپ قارچ با گوشت کوفته ای": {
        name: "Mushroom Soup with Meatballs",
        description: "Mushroom soup served with small meatballs."
    },
    "سوپ": {
        name: "Soup",
        description: "Simple soup."
    },
    "سوپ سیب زمینی و نخود": {
        name: "Potato & Pea Soup",
        description: "Soup made with potatoes and peas."
    },
    "سوپ گوشت و رشته": {
        name: "Meat & Noodle Soup",
        description: "Soup with meat and noodles."
    },
    "سوپ پیاز 2": {
        name: "Onion Soup (Variation)",
        description: "Another variation of onion soup."
    },
    "سوپ پیاز": {
        name: "Onion Soup",
        description: "Classic onion soup."
    },
    "سوپ ماهی": {
        name: "Fish Soup",
        description: "Soup made with fresh fish."
    },
    "سوپ کدو حلوایی": {
        name: "Pumpkin Soup",
        description: "Soup made with sweet pumpkin."
    },
    "سوپ سبزی(ایتالیایی)": {
        name: "Italian Vegetable Soup",
        description: "Italian style vegetable soup."
    },
    "سوپ ذرت": {
        name: "Corn Soup",
        description: "Sweet corn soup."
    },
    "سوپ لوبیا چیتی": {
        name: "Pinto Bean Soup",
        description: "Soup made with pinto beans."
    },
    "سوپ تره فرنگی": {
        name: "Leek Soup",
        description: "Soup made with leeks."
    },
    "سوپ‌ گوجه‌فرنگی با ماکارونی پیچ": {
        name: "Tomato Soup with Fusilli",
        description: "Tomato soup with fusilli pasta."
    },
    "سوپ سبزیجات زمستانی": {
        name: "Winter Vegetable Soup",
        description: "Soup made with winter vegetables."
    },
    "سوپ سفید": {
        name: "White Soup",
        description: "Creamy white soup."
    },
    "سوپ قارچ و مرغ": {
        name: "Mushroom & Chicken Soup",
        description: "Soup with mushrooms and chicken."
    },
    "سوپ خامه": {
        name: "Cream Soup",
        description: "Rich cream soup."
    },
    "سوپ خامه‌ای اسفناج": {
        name: "Creamy Spinach Soup",
        description: "Spinach soup with cream."
    },
    "سوپ فلفل": {
        name: "Pepper Soup",
        description: "Spicy pepper soup."
    },
    "یک سوپ خوشمزه": {
        name: "Delicious Soup",
        description: "A tasty soup recipe."
    },
    "سوپ قارچ و سیب زمینی": {
        name: "Mushroom & Potato Soup",
        description: "Soup with mushrooms and potatoes."
    },
    "سوپ عدس قرمز (دال)": {
        name: "Red Lentil Soup (Dal)",
        description: "Soup made with red lentils."
    },
    "سوپ جو با قارچ": {
        name: "Barley Soup with Mushrooms",
        description: "Barley soup with mushrooms."
    },
    "سوپ تورتیلا": {
        name: "Tortilla Soup",
        description: "Mexican style tortilla soup."
    },
    "سوپ عدس و سیر برای افراد دیابتی نوع (II)": {
        name: "Lentil & Garlic Soup (Diabetic Friendly)",
        description: "Healthy soup suitable for diabetics."
    },
    "سوپ عدس": {
        name: "Lentil Soup",
        description: "Classic lentil soup."
    },
    "سوپ‌ جعفری": {
        name: "Parsley Soup",
        description: "Soup made with fresh parsley."
    },
    "سوپ ماکارونی با نخودفرنگی": {
        name: "Macaroni & Pea Soup",
        description: "Soup with macaroni and peas."
    },
    "کباب گیاهی": {
        name: "Vegetarian Kebab",
        description: "Kebab made with vegetables."
    },
    "خوراک قارچ با برنج وحشی": {
        name: "Mushroom & Wild Rice Stew",
        description: "Stew with mushrooms and wild rice."
    },
    "خوراک کشمشی": {
        name: "Raisin Stew",
        description: "Stew with raisins."
    },
    "خوراک با آب انار": {
        name: "Pomegranate Stew",
        description: "Stew cooked with pomegranate juice."
    },
    "نوعی بلال": {
        name: "Corn on the Cob",
        description: "Corn on the cob recipe."
    },
    "آبگوشت گیاهی": {
        name: "Vegetarian Abgoosht",
        description: "Vegetarian version of traditional Abgoosht."
    },
    "خوراک اسفناج و کنجد": {
        name: "Spinach & Sesame Stew",
        description: "Stew with spinach and sesame seeds."
    },
    "خوراک بروکلی": {
        name: "Broccoli Stew",
        description: "Stew made with broccoli."
    },
    "خوراک اسفناج و سیر": {
        name: "Spinach & Garlic Stew",
        description: "Stew with spinach and garlic."
    },
    "پوره سیب زمینی": {
        name: "Mashed Potatoes",
        description: "Creamy mashed potatoes."
    },
    "خوراک کدو و سیر": {
        name: "Zucchini & Garlic Stew",
        description: "Stew with zucchini and garlic."
    },
    "مارینیت قارچ": {
        name: "Marinated Mushrooms",
        description: "Mushrooms marinated in spices."
    },
    "خوراک کدو و آویشن": {
        name: "Zucchini & Thyme Stew",
        description: "Stew with zucchini and thyme."
    },
    "خوراک سبز ذرت": {
        name: "Green Corn Stew",
        description: "Stew made with green corn."
    },
    "شاهی با مخلوط مخصوص": {
        name: "Cress with Special Mix",
        description: "Watercress served with a special mixture."
    },
    "خوراک اسفناج و گلابی": {
        name: "Spinach & Pear Stew",
        description: "Unique stew with spinach and pear."
    },
    "سبزیجات کباب شده (Roast Vegtables)": {
        name: "Roasted Vegetables",
        description: "Oven roasted mixed vegetables."
    },
    "پيتزا با قارچ": {
        name: "Mushroom Pizza",
        description: "Pizza topped with mushrooms."
    },
    "اردور مرغ و بادام": {
        name: "Chicken & Almond Appetizer",
        description: "Appetizer with chicken and almonds."
    },
    "اردور خيار , كرفس و برگ كاهو": {
        name: "Cucumber, Celery & Lettuce Appetizer",
        description: "Fresh appetizer with cucumber, celery, and lettuce."
    },
    "اردور سوسيس": {
        name: "Sausage Appetizer",
        description: "Appetizer made with sausage."
    },
    "اردور سيب زميني": {
        name: "Potato Appetizer",
        description: "Appetizer made with potatoes."
    },
    "اردور سبزي و پنير": {
        name: "Herb & Cheese Appetizer",
        description: "Appetizer with fresh herbs and cheese."
    },
    "اردور پنير و تخم مرغ": {
        name: "Cheese & Egg Appetizer",
        description: "Appetizer with cheese and eggs."
    },
    "سه اردور بادنجان": {
        name: "Three Eggplant Appetizers",
        description: "Trio of eggplant appetizers."
    },
    "سيني اردور با كالباس": {
        name: "Ham Appetizer Platter",
        description: "Platter of appetizers with ham."
    },
    "سيني اردور با تخم مرغ سفت": {
        name: "Hard Boiled Egg Platter",
        description: "Platter of appetizers with hard boiled eggs."
    },
    "سيني اردور با گوشت سرد": {
        name: "Cold Cut Platter",
        description: "Platter of cold cut meats."
    },
    "کروسان": {
        name: "Croissant",
        description: "Buttery French pastry."
    },
    "همبرگر آسیایی": {
        name: "Asian Burger",
        description: "Burger with Asian flavors."
    },
    "فیش برگر": {
        name: "Fish Burger",
        description: "Burger made with fish fillet."
    },
    "روست بیف": {
        name: "Roast Beef",
        description: "Classic roast beef sandwich."
    },
    "سمبوسه آسیایی": {
        name: "Asian Samosa",
        description: "Samosa with Asian style filling."
    },
    "همبرگر پنیری دوبل": {
        name: "Double Cheeseburger",
        description: "Burger with two patties and cheese."
    },
    "ساندویچ فیله مرغ با پنیر": {
        name: "Chicken Fillet & Cheese Sandwich",
        description: "Sandwich with chicken fillet and cheese."
    },
    "نان سوسیس": {
        name: "Sausage Bread",
        description: "Bread stuffed with sausage."
    },
    "گرلمه": {
        name: "Gozleme",
        description: "Turkish stuffed flatbread."
    },
    "لقمه گوشتی": {
        name: "Meat Wrap",
        description: "Wrap filled with seasoned meat."
    },
    "سمبوسه سبزی": {
        name: "Vegetable Samosa",
        description: "Samosa filled with vegetables."
    },
    "مرغ برگر خانگی": {
        name: "Homemade Chicken Burger",
        description: "Chicken burger made from scratch."
    },
    "ساندويچ كاسه ای مرغ": {
        name: "Chicken Bowl Sandwich",
        description: "Open-faced sandwich bowl with chicken."
    },
    "مثلث پنیری": {
        name: "Cheese Triangle",
        description: "Triangular pastry filled with cheese."
    },
    "ساندویچ مرغ و سبزیجات": {
        name: "Chicken & Veggie Sandwich",
        description: "Sandwich with chicken and vegetables."
    },
    "ساندویچ کالباس و گلابی": {
        name: "Ham & Pear Sandwich",
        description: "Unique sandwich with ham and pear."
    },
    "ساندويچ فرانسوی گرم": {
        name: "Hot French Sandwich",
        description: "Warm sandwich French style."
    },
    "لقمه ‌های فوری مرغ": {
        name: "Quick Chicken Bites",
        description: "Fast and easy chicken wraps."
    },
    "ساندویچ تن‌ماهی": {
        name: "Tuna Sandwich",
        description: "Classic tuna salad sandwich."
    },
    "ساندویچ کیکی": {
        name: "Cake Sandwich",
        description: "Sweet sandwich made with cake layers."
    },
    "ساندویچ کالباس با پنیر مخصوص": {
        name: "Ham & Special Cheese Sandwich",
        description: "Sandwich with ham and special cheese."
    },
    "ساندويچ مونت کريستو": {
        name: "Monte Cristo Sandwich",
        description: "Fried ham and cheese sandwich."
    },
    "قارچ برگر": {
        name: "Mushroom Burger",
        description: "Burger topped with mushrooms."
    },
    "زرافه ساندویچی": {
        name: "Giraffe Sandwich",
        description: "Fun giraffe-shaped sandwich for kids."
    },
    "سانديچ ژامبون با چاشني هندي": {
        name: "Ham Sandwich with Indian Spices",
        description: "Ham sandwich seasoned with Indian spices."
    },
    "املت گل ‌كلم": {
        name: "Cauliflower Omelet",
        description: "Omelet made with cauliflower."
    },
    "املت ماکارونی": {
        name: "Macaroni Omelet",
        description: "Omelet with macaroni pasta."
    },
    "املت عدس": {
        name: "Lentil Omelet",
        description: "Omelet made with lentils."
    },
    "املت تره فرنگی و اسفناج": {
        name: "Leek & Spinach Omelet",
        description: "Omelet with leeks and spinach."
    },
    "املت ایتالیایی": {
        name: "Italian Omelet",
        description: "Italian style frittata."
    },
    "املت پیازچه و پنیر": {
        name: "Scallion & Cheese Omelet",
        description: "Omelet with scallions and cheese."
    },
    "املت اسپانیایی - 2": {
        name: "Spanish Omelet (Variation)",
        description: "Another variation of Spanish omelet."
    },
    "املت با سیر و پنیر": {
        name: "Garlic & Cheese Omelet",
        description: "Omelet with garlic and cheese."
    },
    "املت برنج و پنیر": {
        name: "Rice & Cheese Omelet",
        description: "Omelet made with rice and cheese."
    },
    "املت قارچ و پنیر": {
        name: "Mushroom & Cheese Omelet",
        description: "Omelet with mushrooms and cheese."
    },
    "پای مرغ و سبزیجات": {
        name: "Chicken & Vegetable Pie",
        description: "Savory pie with chicken and vegetables."
    },
    "چیکن فراید": {
        name: "Fried Chicken",
        description: "Crispy fried chicken."
    },
    "کرانچی مرغ": {
        name: "Crunchy Chicken",
        description: "Chicken with a crunchy coating."
    },
    "کباب شترمرغ": {
        name: "Ostrich Kebab",
        description: "Kebab made with ostrich meat."
    },
    "طرز تهیه کالباس مرغ": {
        name: "Homemade Chicken Sausage",
        description: "Recipe for homemade chicken sausage."
    },
    "مرغ با خردل و پنیر": {
        name: "Chicken with Mustard & Cheese",
        description: "Chicken cooked with mustard and cheese."
    },
    "مرغ سوخاری اسپایسی": {
        name: "Spicy Fried Chicken",
        description: "Spicy crispy fried chicken."
    },
    "مرغ همراه با سبزیجات": {
        name: "Chicken with Vegetables",
        description: "Chicken dish served with mixed vegetables."
    },
    "رل فیله مرغ": {
        name: "Chicken Fillet Roll",
        description: "Rolled chicken fillet."
    },
    "خوراک مرغ با جو و قارچ": {
        name: "Chicken, Barley & Mushroom Stew",
        description: "Stew with chicken, barley, and mushrooms."
    },
    "خورشت بلدرچین با سس پرتقال": {
        name: "Quail Stew with Orange Sauce",
        description: "Quail stew served with orange sauce."
    },
    "مرغ با سس قارچ": {
        name: "Chicken with Mushroom Sauce",
        description: "Chicken served with creamy mushroom sauce."
    },
    "خوراك مرغ فوري": {
        name: "Instant Chicken Stew",
        description: "Quick and easy chicken stew."
    },
    "خوراک مرغ و پونه": {
        name: "Chicken & Oregano Stew",
        description: "Chicken stew flavored with oregano."
    },
    "خوراک مرغ با سالاد مخصوص": {
        name: "Chicken with Special Salad",
        description: "Chicken served with a special salad."
    },
    "بال مرغ با سس بادام زمینی": {
        name: "Chicken Wings with Peanut Sauce",
        description: "Chicken wings served with peanut sauce."
    },
    "خوراک مرغ با هویج و کرفس": {
        name: "Chicken, Carrot & Celery Stew",
        description: "Stew with chicken, carrots, and celery."
    },
    "خوراک مرغ با نارنگی": {
        name: "Chicken with Tangerine",
        description: "Chicken cooked with tangerine."
    },
    "خوراک مرغ با پاستای ادویه دار": {
        name: "Chicken with Spiced Pasta",
        description: "Chicken served with spicy pasta."
    },
    "بوقلمون کریسمس": {
        name: "Christmas Turkey",
        description: "Traditional roasted turkey."
    },
    "کیوسکی (سینه مرغ)": {
        name: "Chicken Kiev",
        description: "Breaded chicken breast rolled with butter."
    },
    "چیکن استروگانف": {
        name: "Chicken Stroganoff",
        description: "Creamy chicken stroganoff."
    },
    "خوراک مرغ و قارچ": {
        name: "Chicken & Mushroom Stew",
        description: "Stew with chicken and mushrooms."
    },
    "خوراک کدو با سوسیس": {
        name: "Zucchini & Sausage Stew",
        description: "Stew with zucchini and sausage."
    },
    "خوراک بال مرغ": {
        name: "Chicken Wing Stew",
        description: "Stew made with chicken wings."
    },
    "خوراک گوشت زنجبیلی": {
        name: "Ginger Meat Stew",
        description: "Meat stew flavored with ginger."
    },
    "خوراک مخصوص زبان": {
        name: "Special Tongue Stew",
        description: "Special stew made with beef tongue."
    },
    "خوراک هویج": {
        name: "Carrot Stew",
        description: "Stew made with carrots."
    },
    "خوراک ماهیچه و مرغ": {
        name: "Muscle & Chicken Stew",
        description: "Stew with muscle meat and chicken."
    },
    "قارچ و قلوه": {
        name: "Mushroom & Kidney",
        description: "Dish made with mushrooms and kidneys."
    },
    "خوراک زبان سوخاری": {
        name: "Fried Tongue",
        description: "Breaded and fried beef tongue."
    },
    "خوراک ماهی با سالاد گوجه فرنگی": {
        name: "Fish with Tomato Salad",
        description: "Fish served with tomato salad."
    },
    "خوراک لوبيا سبز و سوسيس": {
        name: "Green Bean & Sausage Stew",
        description: "Stew with green beans and sausage."
    },
    "خوراک حبوبات": {
        name: "Legume Stew",
        description: "Stew made with mixed legumes."
    },
    "خوراک فیله گوشت": {
        name: "Meat Fillet Stew",
        description: "Stew made with meat fillet."
    },
    "خوراک نعنا جعفری": {
        name: "Mint & Parsley Stew",
        description: "Stew flavored with mint and parsley."
    },
    "خوراک گل کلم و لوبیا سبز": {
        name: "Cauliflower & Green Bean Stew",
        description: "Stew with cauliflower and green beans."
    },
    "خوراک كاهو و ژامبون": {
        name: "Lettuce & Ham Stew",
        description: "Stew with lettuce and ham."
    },
    "خوراک میگو": {
        name: "Shrimp Stew",
        description: "Stew made with shrimp."
    },
    "بیف مدیترانه ای": {
        name: "Mediterranean Beef",
        description: "Beef dish Mediterranean style."
    },
    "خوراک گوشت و پیاز": {
        name: "Meat & Onion Stew",
        description: "Stew with meat and onions."
    },
    "خوراک لوبیا سبز با گوشت": {
        name: "Green Bean & Meat Stew",
        description: "Stew with green beans and meat."
    },
    "خوراک زبان": {
        name: "Tongue Stew",
        description: "Stew made with beef tongue."
    },
    "خوراک مرغ بریان": {
        name: "Roasted Chicken",
        description: "Whole roasted chicken."
    },
    "بیف بروکلی": {
        name: "Beef Broccoli",
        description: "Stir-fry with beef and broccoli."
    },
    "پیتزا انبه": {
        name: "Mango Pizza",
        description: "Pizza topped with mango."
    },
    "پیتزای سیب زمینی 2": {
        name: "Potato Pizza (Variation)",
        description: "Another variation of potato pizza."
    },
    "پیتزا استوایی": {
        name: "Tropical Pizza",
        description: "Pizza with tropical toppings."
    },
    "پیتزا قارچ و گوشت": {
        name: "Mushroom & Meat Pizza",
        description: "Pizza with mushrooms and meat."
    },
    "پیتزا سوسیس دودی و ماء الشعیر": {
        name: "Smoked Sausage & Beer Pizza",
        description: "Pizza with smoked sausage and beer dough."
    },
    "پیتزا رول - 2": {
        name: "Pizza Roll (Variation)",
        description: "Another variation of pizza rolls."
    },
    "پيتزا تست": {
        name: "Toast Pizza",
        description: "Pizza made on toast bread."
    },
    "پیتزا دوطرفه لوبیا قرمز": {
        name: "Double-Sided Red Bean Pizza",
        description: "Stuffed pizza with red beans."
    },
    "پیتزا سیب زمینی": {
        name: "Potato Pizza",
        description: "Pizza with potato topping."
    },
    "لقمه های فوری با پنیر و زیتون": {
        name: "Quick Cheese & Olive Bites",
        description: "Quick bites with cheese and olives."
    },
    "پیتزای پته ( تره آستارایی )": {
        name: "Pate Pizza (Astara Leek)",
        description: "Pizza with Astara style leeks."
    },
    "پیتزای اسفناج و تخم مرغ": {
        name: "Spinach & Egg Pizza",
        description: "Pizza topped with spinach and eggs."
    },
    "پیتزا با خمیر گندم کامل": {
        name: "Whole Wheat Pizza",
        description: "Pizza made with whole wheat dough."
    },
    "پیتزا مارگاریتا": {
        name: "Margherita Pizza",
        description: "Classic Margherita pizza."
    },
    "پیتزا مرغ و کلم": {
        name: "Chicken & Cabbage Pizza",
        description: "Pizza topped with chicken and cabbage."
    },
    "پیتزای قارچ با تخم مرغ": {
        name: "Mushroom & Egg Pizza",
        description: "Pizza with mushrooms and eggs."
    },
    "پيتزا با نان لبناني": {
        name: "Lebanese Bread Pizza",
        description: "Pizza made on Lebanese bread."
    },
    "پیتزا کاسه ای": {
        name: "Pizza Bowl",
        description: "Pizza served in a bowl."
    },
    "پیتزا رول": {
        name: "Pizza Roll",
        description: "Rolled pizza."
    },
    "پیتزا قلب": {
        name: "Heart Pizza",
        description: "Heart-shaped pizza."
    },
    "پیتزای لوبیا با گوشت چرخ کرده": {
        name: "Bean & Ground Meat Pizza",
        description: "Pizza with beans and ground meat."
    },
    "پیتزای مرغ": {
        name: "Chicken Pizza",
        description: "Pizza topped with chicken."
    },
    "پیتزا لازانیا": {
        name: "Lasagna Pizza",
        description: "Pizza with lasagna flavors."
    },
    "پیتزای آناناس": {
        name: "Pineapple Pizza",
        description: "Pizza topped with pineapple."
    },
    "پنیر سوخاری": {
        name: "Fried Cheese",
        description: "Breaded and fried cheese."
    },
    "خمیر پیتزا‎": {
        name: "Pizza Dough",
        description: "Homemade pizza dough."
    },
    "پیتزا در خانه": {
        name: "Homemade Pizza",
        description: "Pizza made at home."
    },
    "پیتزای فلفل رنگی": {
        name: "Colorful Pepper Pizza",
        description: "Pizza with colorful bell peppers."
    },
    "پیتزای دریایی": {
        name: "Seafood Pizza",
        description: "Pizza topped with seafood."
    },
    "پیتزا با قارچ": {
        name: "Mushroom Pizza",
        description: "Pizza topped with mushrooms."
    },
    "پیتزای سیب زمینی با پختی ترکیبی": {
        name: "Potato Pizza (Combo Bake)",
        description: "Potato pizza cooked with combination method."
    },
    "پیتزا پنیر ( زمان پخت: ۱۵ دقیقه )": {
        name: "Cheese Pizza",
        description: "Simple cheese pizza."
    },
    "پیتزای سفید": {
        name: "White Pizza",
        description: "Pizza with white sauce."
    },
    "پیتزای سوسیس": {
        name: "Sausage Pizza",
        description: "Pizza topped with sausage."
    },
    "پیتزا چهارفصل‌": {
        name: "Four Seasons Pizza",
        description: "Pizza with four different toppings."
    },
    "پیتزا سبزیجات‌": {
        name: "Vegetable Pizza",
        description: "Pizza topped with mixed vegetables."
    },
    "پیتزای‌ حبوبات‌ و گوشت‌ چرخ‌ كرده‌": {
        name: "Legume & Ground Meat Pizza",
        description: "Pizza with legumes and ground meat."
    },
    "پیتزا با قارچ‌ و سوسیس‌": {
        name: "Mushroom & Sausage Pizza",
        description: "Pizza with mushrooms and sausage."
    },
    "پیتزای‌ ذرت‌": {
        name: "Corn Pizza",
        description: "Pizza topped with corn."
    },
    "پیتزای سبزی": {
        name: "Vegetable Pizza",
        description: "Pizza with vegetable toppings."
    },
    "پیتزای پنیر و تخم مرغ": {
        name: "Cheese & Egg Pizza",
        description: "Pizza with cheese and eggs."
    },
    "پیتزای گوشت": {
        name: "Meat Pizza",
        description: "Pizza topped with meat."
    },
    "پیتزای ژامبون یا ماهی": {
        name: "Ham or Fish Pizza",
        description: "Pizza with ham or fish topping."
    },
    "پیتزا ماهی ساردین": {
        name: "Sardine Pizza",
        description: "Pizza topped with sardines."
    },
    "پیتزا تنوری با مرغ": {
        name: "Tandoori Chicken Pizza",
        description: "Pizza with tandoori chicken."
    },
    "پیتزای تنوری با گوشت": {
        name: "Tandoori Meat Pizza",
        description: "Pizza with tandoori meat."
    },
    "پیتزای مكزیكی": {
        name: "Mexican Pizza",
        description: "Spicy Mexican style pizza."
    },
    "خمیر پیتزا 2": {
        name: "Pizza Dough (Variation)",
        description: "Another pizza dough recipe."
    },
    "پیتزای گوشت و اسفناج": {
        name: "Meat & Spinach Pizza",
        description: "Pizza with meat and spinach."
    },
    "پیتزای تند سبزیجات": {
        name: "Spicy Vegetable Pizza",
        description: "Spicy pizza with vegetables."
    },
    "کباب میگو": {
        name: "Shrimp Kebab",
        description: "Grilled shrimp kebab."
    },
    "کباب بختیاری حلزونی": {
        name: "Bakhtiari Snail Kebab",
        description: "Bakhtiari kebab rolled like a snail."
    },
    "کباب چنجه": {
        name: "Chenjeh Kebab",
        description: "Grilled chunks of marinated meat."
    },
    "کباب کوبیده - 2": {
        name: "Kebab Koobideh (Variation)",
        description: "Another recipe for Kebab Koobideh."
    },
    "گوشت کبابی معطر": {
        name: "Aromatic Grilled Meat",
        description: "Grilled meat with aromatic spices."
    },
    "کباب جوجه": {
        name: "Chicken Kebab (Joojeh)",
        description: "Grilled chicken kebab."
    },
    "کباب مرغ": {
        name: "Chicken Kebab",
        description: "Grilled chicken kebab."
    },
    "کباب بالشتکی": {
        name: "Pillow Kebab",
        description: "Pillow-shaped kebab."
    },
    "قلیه میگو": {
        name: "Shrimp Ghalieh",
        description: "Spicy shrimp stew from Southern Iran."
    },
    "خورش جغله بادام": {
        name: "Fresh Almond Stew",
        description: "Stew made with fresh almonds."
    },
    "خورشت ماست": {
        name: "Yogurt Stew",
        description: "Sweet saffron yogurt stew from Isfahan."
    },
    "خورشت جوجه و غوره و بادمجان": {
        name: "Chicken, Unripe Grape & Eggplant Stew",
        description: "Stew with chicken, unripe grapes, and eggplant."
    },
    "خورش ماهی": {
        name: "Fish Stew",
        description: "Stew made with fish."
    },
    "خورشت مرغ با بامیه": {
        name: "Chicken & Okra Stew",
        description: "Stew with chicken and okra."
    },
    "خورش آلو مُسمی": {
        name: "Plum Mosama Stew",
        description: "Stew with plums and chicken."
    },
    "خورش تَره": {
        name: "Leek Stew",
        description: "Stew made with fresh leeks."
    },
    "خورش نخودفرنگی با مرغ": {
        name: "Pea & Chicken Stew",
        description: "Stew with peas and chicken."
    },
    "خورش قیمه کدو": {
        name: "Gheimeh Zucchini Stew",
        description: "Gheimeh stew with zucchini."
    },
    "خورشت گوشت چرخ کرده با لوبیا قرمز": {
        name: "Ground Meat & Red Bean Stew",
        description: "Stew with ground meat and red beans."
    },
    "راتاتویی دونفره": {
        name: "Ratatouille for Two",
        description: "Classic French vegetable stew."
    },
    "مرغ ترش و شیرین": {
        name: "Sweet & Sour Chicken",
        description: "Chicken with sweet and sour sauce."
    },
    "مرجو خورش (خورش عدس)": {
        name: "Lentil Stew (Marju Khoresh)",
        description: "Traditional lentil stew."
    },
    "خورش بادمجان و مرغ": {
        name: "Eggplant & Chicken Stew",
        description: "Stew with eggplant and chicken."
    },
    "خورشت میگو": {
        name: "Shrimp Stew",
        description: "Stew made with shrimp."
    },
    "خورش کد‌و حلوایی با آلو": {
        name: "Pumpkin & Plum Stew",
        description: "Stew with pumpkin and plums."
    },
    "خورش رنگارنگ": {
        name: "Colorful Stew",
        description: "Stew with colorful vegetables."
    },
    "خورش فسنجان با مرغابی": {
        name: "Duck Fesenjan",
        description: "Walnut and pomegranate stew with duck."
    },
    "خورش کاری(غذای هندی)": {
        name: "Indian Curry Stew",
        description: "Indian style curry stew."
    },
    "خورش ریواس": {
        name: "Rhubarb Stew",
        description: "Tart stew made with rhubarb."
    },
    "قیمه، خورشی نذری": {
        name: "Nazri Gheimeh",
        description: "Traditional Gheimeh served during religious ceremonies."
    },
    "خورش به": {
        name: "Quince Stew",
        description: "Stew made with quince."
    },
    "خورشت مرغ اناریجه": {
        name: "Anarijeh Chicken Stew",
        description: "Chicken stew with Anarijeh herbs."
    },
    "خورشت لوبیا و هویج": {
        name: "Bean & Carrot Stew",
        description: "Stew with beans and carrots."
    },
    "خورش تره‌فرنگی": {
        name: "Leek Stew",
        description: "Stew made with leeks."
    },
    "خورشت گل کلم": {
        name: "Cauliflower Stew",
        description: "Stew made with cauliflower."
    },
    "خورشت آلو اسفناج": {
        name: "Plum & Spinach Stew",
        description: "Stew with plums and spinach."
    },
    "خورش ماست": {
        name: "Yogurt Stew",
        description: "Sweet yogurt stew."
    },
    "خورش هویج": {
        name: "Carrot Stew",
        description: "Stew made with carrots."
    },
    "خورش نعنا جعفری و گوجه سبز": {
        name: "Herb & Greengage Stew",
        description: "Stew with herbs and greengages."
    },
    "خورش مرغ مکزیکی": {
        name: "Mexican Chicken Stew",
        description: "Spicy Mexican style chicken stew."
    },
    "خورشت فسنجان": {
        name: "Fesenjan Stew",
        description: "Walnut and pomegranate stew."
    },
    "خورشت قیمه": {
        name: "Gheimeh Stew",
        description: "Split pea and meat stew."
    },
    "قرمه سبزی": {
        name: "Ghormeh Sabzi",
        description: "Herb stew with beans and meat."
    },
    "خورش خلال کرمانشاهی": {
        name: "Kermanshah Almond Stew",
        description: "Almond sliver stew."
    },
    "خورش بامیه": {
        name: "Okra Stew",
        description: "Stew made with okra."
    },
    "خورش مرغ ترش (غذای شمالی)": {
        name: "Sour Chicken Stew",
        description: "Northern style sour chicken stew."
    },
    "خورش قارچ": {
        name: "Mushroom Stew",
        description: "Stew made with mushrooms."
    },
    "خورش کنگر": {
        name: "Artichoke Stew (Kangar)",
        description: "Stew made with wild artichoke."
    },
    "خورش کرفس": {
        name: "Celery Stew",
        description: "Stew made with celery and herbs."
    },
    "خورشت باقلاقاتق": {
        name: "Baghali Ghatogh",
        description: "Fava bean and dill stew."
    },
    "خورش خلال بادام": {
        name: "Almond Sliver Stew",
        description: "Stew with almond slivers."
    },
    "متبل با بادنجان": {
        name: "Mutabal",
        description: "Eggplant dip."
    },
    "خورش گوجه سبز": {
        name: "Greengage Stew",
        description: "Tart stew made with greengages."
    },
    "خورش كدو بادنجان": {
        name: "Zucchini & Eggplant Stew",
        description: "Stew with zucchini and eggplant."
    },
    "خورش قیمه با گوشت چرخ کرده": {
        name: "Ground Meat Gheimeh",
        description: "Gheimeh stew with ground meat."
    },
    "خورش كاری با ماهی": {
        name: "Fish Curry Stew",
        description: "Curry stew made with fish."
    },
    "خورش چاغاله ‌بادام": {
        name: "Green Almond Stew",
        description: "Stew made with fresh green almonds."
    },
    "خورشت میگو ساده": {
        name: "Simple Shrimp Stew",
        description: "Simple stew made with shrimp."
    },
    "خورش کدو( رژیمی)": {
        name: "Zucchini Stew (Diet)",
        description: "Diet-friendly zucchini stew."
    },
    "خورش مرغ ساده": {
        name: "Simple Chicken Stew",
        description: "Basic chicken stew."
    },
    "خورشت سیب وآلبالو": {
        name: "Apple & Sour Cherry Stew",
        description: "Stew with apples and sour cherries."
    },
    "خورشت‌ آلو با مرغ‌": {
        name: "Plum & Chicken Stew",
        description: "Stew with plums and chicken."
    },
    "خورش مهاراجه": {
        name: "Maharaja Stew",
        description: "Spicy Indian style stew."
    },
    "خورش رنگین کمان": {
        name: "Rainbow Stew",
        description: "Stew with colorful vegetables."
    },
    "خورش گل کلم با سیر": {
        name: "Cauliflower & Garlic Stew",
        description: "Stew with cauliflower and garlic."
    },
    "نکاتی برای انواع خورش": {
        name: "Stew Cooking Tips",
        description: "Tips for cooking various stews."
    },
    "جعفرى قورمه": {
        name: "Parsley Ghormeh",
        description: "Stew made with parsley and meat."
    },
    "خورش مطنجن": {
        name: "Motanjan Stew",
        description: "Traditional stew with meat and dried fruits."
    },
    "خورش مرغ مکزیکی": {
        name: "Mexican Chicken Stew",
        description: "Spicy Mexican style chicken stew."
    },
    "خورش ریحان": {
        name: "Basil Stew",
        description: "Stew flavored with fresh basil."
    },
    "خورش مرغ ترش (غذای شمالی)": {
        name: "Sour Chicken Stew",
        description: "Northern style sour chicken stew."
    },
    "سیر قلیه گیلانی": {
        name: "Gilani Garlic Stew",
        description: "Garlic stew from Gilan province."
    },
    "خورش ماست به طریق هندی": {
        name: "Indian Yogurt Stew",
        description: "Indian style yogurt stew."
    },
    "پف طلایی": {
        name: "Golden Puff",
        description: "Golden puffed pastry or dish."
    },
    "رولت گوشت و سبزیجات": {
        name: "Meat & Vegetable Roll",
        description: "Meat roll filled with vegetables."
    },
    "کرپ گوشت": {
        name: "Meat Crepe",
        description: "Crepe filled with savory meat."
    },
    "فيله استيك پيتزايولا": {
        name: "Fillet Steak Pizzaiola",
        description: "Steak cooked in pizza style sauce."
    },
    "رولت گوشتی": {
        name: "Meat Roll",
        description: "Rolled meat dish."
    },
    "استیک با نعناع و لیمو": {
        name: "Mint & Lemon Steak",
        description: "Steak flavored with mint and lemon."
    },
    "قلقلی گوشتی": {
        name: "Meatballs",
        description: "Small round meatballs."
    },
    "کله گنجشکی": {
        name: "Sparrow Head (Meatballs)",
        description: "Small meatballs in sauce (Kalleh Gonjeshki)."
    },
    "رولت دورنگ (گوشت و مرغ)": {
        name: "Two-Color Roll (Meat & Chicken)",
        description: "Roll made with layers of meat and chicken."
    },
    "رولت مرغ و گوشت": {
        name: "Chicken & Meat Roll",
        description: "Roll with chicken and meat."
    },
    "پای گوشت": {
        name: "Meat Pie",
        description: "Savory pie filled with meat."
    },
    "استیک فلفلی": {
        name: "Pepper Steak",
        description: "Steak with pepper sauce."
    },
    "خوراک گوشت با تخم مرغ": {
        name: "Meat & Egg Dish",
        description: "Dish made with meat and eggs."
    },
    "رولت گوشت و مرغ": {
        name: "Meat & Chicken Roll",
        description: "Roll with meat and chicken."
    },
    "كالباس گوشت": {
        name: "Meat Sausage",
        description: "Homemade meat sausage."
    },
    "فیله استیک پنیر با سبزیجات": {
        name: "Cheese Steak Fillet with Veggies",
        description: "Steak fillet with cheese and vegetables."
    },
    "رولت گوشتی سه رنگ": {
        name: "Three-Color Meat Roll",
        description: "Meat roll with three colored fillings."
    },
    "خوراك گوچ با گوشت بره - 2": {
        name: "Lamb Goulash (Variation)",
        description: "Another variation of lamb goulash."
    },
    "اسنک گوشت": {
        name: "Meat Snack",
        description: "Snack made with meat."
    },
    "ژیگو قارچ": {
        name: "Mushroom Gigot",
        description: "Lamb leg with mushrooms."
    },
    "رولت گوشت با پنیر": {
        name: "Meat Roll with Cheese",
        description: "Meat roll filled with cheese."
    },
    "هوته فر کاسه": {
        name: "Hoteh Far Kaseh",
        description: "Traditional dish."
    },
    "گول بورگ با گوشت": {
        name: "Meat Gulberg",
        description: "Gulberg dish made with meat."
    },
    "گراتن قارچ": {
        name: "Mushroom Gratin",
        description: "Gratin made with mushrooms."
    },
    "گالت كوچک با قارچ": {
        name: "Small Mushroom Galette",
        description: "Small savory tart with mushrooms."
    },
    "كرپ اسفناج": {
        name: "Spinach Crepe",
        description: "Crepe filled with spinach."
    },
    "كراكر بادام": {
        name: "Almond Cracker",
        description: "Cracker made with almonds."
    },
    "قارچ و بريوش": {
        name: "Mushroom Brioche",
        description: "Brioche bread with mushrooms."
    },
    "فيله ليمو لهستانی": {
        name: "Polish Lemon Fillet",
        description: "Lemon flavored fillet Polish style."
    },
    "رولت پنیر": {
        name: "Cheese Roll",
        description: "Roll filled with cheese."
    },
    "رول های فانتزی": {
        name: "Fancy Rolls",
        description: "Decorative savory rolls."
    },
    "راتاتوی - خوراک سبزيجات فرانسوی": {
        name: "Ratatouille",
        description: "French vegetable stew."
    },
    "خوراک مرغ فرانسوی با سس پرتقال": {
        name: "French Chicken with Orange Sauce",
        description: "French style chicken with orange sauce."
    },
    "ترتیلا": {
        name: "Tortilla",
        description: "Spanish omelet or Mexican flatbread."
    },
    "تاکو - مکزیکی": {
        name: "Mexican Taco",
        description: "Traditional Mexican taco."
    },
    "پلوی قالبی فرانسوی": {
        name: "French Molded Rice",
        description: "Rice dish served in a mold French style."
    },
    "پاكورا": {
        name: "Pakora",
        description: "Indian fried snack."
    },
    "پاستا با سس آلفردو مرغ 2": {
        name: "Chicken Alfredo Pasta (Variation)",
        description: "Pasta with chicken and Alfredo sauce."
    },
    "بيف استرو گانوف - 3": {
        name: "Beef Stroganoff (Variation 3)",
        description: "Another variation of Beef Stroganoff."
    },
    "بنیه میگو ( پفی ) با سس تارتار": {
        name: "Puffed Shrimp Beignet with Tartar Sauce",
        description: "Fried shrimp batter served with tartar sauce."
    },
    "بنیه مرغ ، گل کلم ، پیاز": {
        name: "Chicken, Cauliflower & Onion Beignet",
        description: "Fried batter with chicken, cauliflower, and onion."
    },
    "برد فیش": {
        name: "Breaded Fish",
        description: "Fish coated in breadcrumbs."
    },
    "کوپ پیاز و سیب زمینی": {
        name: "Onion & Potato Coupe",
        description: "Dish made with onion and potato."
    },
    "کرواسان ژامبون مرغ": {
        name: "Chicken Ham Croissant",
        description: "Croissant filled with chicken ham."
    },
    "کتف مرغ با سس عسل": {
        name: "Honey Chicken Wings",
        description: "Chicken wings glazed with honey sauce."
    },
    "کباب ایسلیم": {
        name: "Islim Kebab",
        description: "Eggplant wrapped meatballs."
    },
    "مرغ کیو - روسیه": {
        name: "Chicken Kiev",
        description: "Russian style stuffed chicken breast."
    },
    "گالانین": {
        name: "Galantine",
        description: "Stuffed meat dish."
    },
    "رشته پلو فرنگی": {
        name: "Western Style Noodle Rice",
        description: "Rice with noodles western style."
    },
    "پیراشکی پیتزا": {
        name: "Pizza Pirozhki",
        description: "Fried dough filled with pizza ingredients."
    },
    "بیف استروگانف - 2": {
        name: "Beef Stroganoff (Variation 2)",
        description: "Another recipe for Beef Stroganoff."
    },
    "ایگرول - چینی": {
        name: "Chinese Egg Roll",
        description: "Fried egg roll Chinese style."
    },
    "کانلوئی با قارچ و اسفناج": {
        name: "Mushroom & Spinach Cannelloni",
        description: "Cannelloni pasta filled with mushroom and spinach."
    },
    "نان سمیت - ترکیه": {
        name: "Simit Bread",
        description: "Turkish sesame bagel."
    },
    "نان با پنیر و پیازچه": {
        name: "Cheese & Scallion Bread",
        description: "Bread stuffed with cheese and scallions."
    },
    "بورک با خمیر یوفکا": {
        name: "Borek with Yufka Dough",
        description: "Turkish pastry made with Yufka dough."
    },
    "رول کدو و بادمجان": {
        name: "Zucchini & Eggplant Roll",
        description: "Rolls made with zucchini and eggplant."
    },
    "املت تایلندی": {
        name: "Thai Omelet",
        description: "Thai style omelet."
    },
    "خوراک میگو ایتالیایی": {
        name: "Italian Shrimp Dish",
        description: "Shrimp cooked Italian style."
    },
    "کاری گوشت بره با سبزیجات": {
        name: "Lamb Curry with Vegetables",
        description: "Lamb curry served with mixed vegetables."
    },
    "پوره ی کام چوری": {
        name: "Kamchuri Puree",
        description: "Special puree dish."
    },
    "مرغ سوخاری": {
        name: "Fried Chicken",
        description: "Crispy fried chicken."
    },
    "ماروکا": {
        name: "Maroca",
        description: "Special dish."
    },
    "کروکت برنج": {
        name: "Rice Croquette",
        description: "Fried rice balls."
    },
    "سیب زمینی تنوری اگلیسی": {
        name: "English Baked Potato",
        description: "Baked potato English style."
    },
    "رولت سبزیجات": {
        name: "Vegetable Roll",
        description: "Roll filled with vegetables."
    },
    "سوپ پیاز فرانسوی": {
        name: "French Onion Soup",
        description: "Classic French onion soup."
    },
    "آبولابولا": {
        name: "Abulabula",
        description: "Special dish."
    },
    "راتاتویی دونفره": {
        name: "Ratatouille for Two",
        description: "Ratatouille portioned for two."
    },
    "رولت گوشت فرانسوی": {
        name: "French Meat Roll",
        description: "Meat roll French style."
    },
    "کروکت سیب زمینی": {
        name: "Potato Croquette",
        description: "Fried potato rolls."
    },
    "غذاي ايتاليايي": {
        name: "Italian Dish",
        description: "General Italian dish."
    },
    "بیف": {
        name: "Beef",
        description: "Beef dish."
    },
    "رولت گوشت با قارچ": {
        name: "Meat Roll with Mushroom",
        description: "Meat roll filled with mushrooms."
    },
    "اسکالوپ بوقلمون تایلندی": {
        name: "Thai Turkey Scallop",
        description: "Turkey scallop Thai style."
    },
    "خوراک كرادو": {
        name: "Corrado Dish",
        description: "Special Corrado dish."
    },
    "خوراك لازانيا ایتالیایی": {
        name: "Italian Lasagna",
        description: "Classic Italian lasagna."
    },
    "كالزونه ( غذاي ايتاليايي )": {
        name: "Calzone",
        description: "Italian folded pizza."
    },
    "سوپ اسپانيائی": {
        name: "Spanish Soup",
        description: "Soup Spanish style."
    },
    "کوکوی اسپاگتی (ایتالیایی)": {
        name: "Spaghetti Frittata",
        description: "Frittata made with spaghetti."
    },
    "چیپس قارچ": {
        name: "Mushroom Chips",
        description: "Crispy fried mushroom slices."
    },
    "پاستيتسو ( يك نوع غذاي يوناني)": {
        name: "Pastitsio",
        description: "Greek baked pasta dish."
    },
    "تاریخچه پیتزا": {
        name: "History of Pizza",
        description: "Article about the history of pizza."
    },
    "پای بروکلی (نوعی غذای آلمانی)": {
        name: "Broccoli Pie",
        description: "German style broccoli pie."
    },
    "اسپانیش پلیت": {
        name: "Spanish Plate",
        description: "Platter of Spanish appetizers."
    },
    "سینی سیب زمینی با مرغ به طریقه آلمانی": {
        name: "German Style Potato & Chicken Platter",
        description: "Chicken and potato platter German style."
    },
    "خوراك ايتاليايي با مرغ و زيتون": {
        name: "Italian Chicken & Olive Dish",
        description: "Chicken and olive dish Italian style."
    },
    "صبحانه سوئیسی": {
        name: "Swiss Breakfast",
        description: "Swiss style breakfast."
    },
    "ذرت مكزيكی": {
        name: "Mexican Corn",
        description: "Mexican street corn."
    },
    "پلوي سنتي ليموزين ( فرانسه)": {
        name: "Traditional Limousin Rice",
        description: "Traditional French rice dish."
    },
    "خوراك باميه در سواحل مديترانه": {
        name: "Mediterranean Okra Dish",
        description: "Okra dish Mediterranean style."
    },
    "پلو مكزيكي": {
        name: "Mexican Rice",
        description: "Spicy Mexican style rice."
    },
    "سوپ لوبيا چيتي (مكزيك )": {
        name: "Mexican Pinto Bean Soup",
        description: "Pinto bean soup Mexican style."
    },
    "پای بروکلی ( آلمان)": {
        name: "German Broccoli Pie",
        description: "Broccoli pie German style."
    },
    "سوپ خامه‌ای اسفناج (مجارستان )": {
        name: "Hungarian Creamy Spinach Soup",
        description: "Creamy spinach soup Hungarian style."
    },
    "كوكوی سبزی‌های زمستانی ( ایتالیا )": {
        name: "Italian Winter Vegetable Frittata",
        description: "Frittata with winter vegetables Italian style."
    },
    "خوراک بادنجان ( ايتاليا )": {
        name: "Italian Eggplant Dish",
        description: "Eggplant dish Italian style."
    },
    "سالاد مرغ و فلفل( مكزيك)": {
        name: "Mexican Chicken & Pepper Salad",
        description: "Chicken and pepper salad Mexican style."
    },
    "رتی فيله( فرانسه )": {
        name: "French Fillet Roast",
        description: "Roast fillet French style."
    },
    "دراچنا (غذاي‌ روسي‌)": {
        name: "Drachena",
        description: "Russian egg dish."
    },
    "بوریتو با مرغ و برنج ( مکزیک )": {
        name: "Chicken & Rice Burrito",
        description: "Burrito filled with chicken and rice."
    },
    "سوپ قارچ با خامه و پنیر ( ایتالیا )": {
        name: "Italian Mushroom Soup",
        description: "Creamy mushroom soup with cheese."
    },
    "خوراک گوشت و قارچ ( ایتالیا )": {
        name: "Italian Meat & Mushroom Dish",
        description: "Meat and mushroom dish Italian style."
    },
    "پاستا با سس(ایتالیا )": {
        name: "Pasta with Sauce",
        description: "Classic Italian pasta with sauce."
    },
    "مرغ (ایتالیا)": {
        name: "Italian Chicken",
        description: "Chicken cooked Italian style."
    },
    "قارچ سوخاری فلورانسی ( ایتالیا )": {
        name: "Florentine Fried Mushrooms",
        description: "Fried mushrooms Florentine style."
    },
    "فریتاتا کدو و پپرونی ( ایتالیا )": {
        name: "Zucchini & Pepperoni Frittata",
        description: "Frittata with zucchini and pepperoni."
    },
    "سالاد سیب زمینی ( ایتالیا)": {
        name: "Italian Potato Salad",
        description: "Potato salad Italian style."
    },
    "سالاد روسی": {
        name: "Russian Salad",
        description: "Classic Russian salad (Olivier Salad)."
    },
    "املت ( فرانسه )": {
        name: "French Omelet",
        description: "Classic French omelet."
    },
    "چيکن آلاکينگ ( فرانسه)": {
        name: "Chicken a la King",
        description: "Chicken in cream sauce with vegetables."
    },
    "ساق پر شده مرغ (کانادایی)": {
        name: "Stuffed Chicken Drumsticks",
        description: "Chicken drumsticks stuffed Canadian style."
    },
    "کيک شکلاتي با مايکروفر": {
        name: "Microwave Chocolate Cake",
        description: "Chocolate cake baked in a microwave."
    },
    "نان گردويي با مايکروفر": {
        name: "Microwave Walnut Bread",
        description: "Walnut bread baked in a microwave."
    },
    "راتاکو": {
        name: "Rataco",
        description: "Special dish."
    },
    "کباب میگو": {
        name: "Shrimp Kebab",
        description: "Grilled shrimp kebab."
    },
    "مربای توت فرنگی": {
        name: "Strawberry Jam",
        description: "Homemade strawberry jam."
    },
    "کمپوت هلو با مايکروفر": {
        name: "Microwave Peach Compote",
        description: "Peach compote made in a microwave."
    },
    "کمپوت سيب با مايکروفر": {
        name: "Microwave Apple Compote",
        description: "Apple compote made in a microwave."
    },
    "کمپوت زرد آلو با مايکروفر": {
        name: "Microwave Apricot Compote",
        description: "Apricot compote made in a microwave."
    },
    "کمپوت آلبالو با مايکروفر": {
        name: "Microwave Sour Cherry Compote",
        description: "Sour cherry compote made in a microwave."
    },
    "پياز داغ با مايکروفر": {
        name: "Microwave Fried Onions",
        description: "Fried onions made in a microwave."
    },
    "پوره سيب زميني با مايکروفر": {
        name: "Microwave Mashed Potatoes",
        description: "Mashed potatoes made in a microwave."
    },
    "فرني با مايکروفر": {
        name: "Microwave Fereni",
        description: "Rice pudding made in a microwave."
    },
    "شير برنج با مايکروفر": {
        name: "Microwave Rice Pudding",
        description: "Rice pudding made in a microwave."
    },
    "گراتن سيب زميني با مايکروفر": {
        name: "Microwave Potato Gratin",
        description: "Potato gratin cooked in a microwave."
    },
    "لازانيا با مايکروفر": {
        name: "Microwave Lasagna",
        description: "Lasagna cooked in a microwave."
    },
    "دلمه گوجه فرنگي با مايکروفر": {
        name: "Microwave Stuffed Tomato",
        description: "Stuffed tomato cooked in a microwave."
    },
    "دلمه فلفل سبز با مايکروفر": {
        name: "Microwave Stuffed Pepper",
        description: "Stuffed pepper cooked in a microwave."
    },
    "اسپاگتي با مايکروفر": {
        name: "Microwave Spaghetti",
        description: "Spaghetti cooked in a microwave."
    },
    "پاي پوره سيب زميني با مايکروفر": {
        name: "Microwave Shepherd's Pie",
        description: "Shepherd's pie cooked in a microwave."
    },
    "کباب تابه اي با مايکروفر": {
        name: "Microwave Pan Kebab",
        description: "Pan kebab cooked in a microwave."
    },
    "همبرگر با مايکروفر": {
        name: "Microwave Hamburger",
        description: "Hamburger cooked in a microwave."
    },
    "ميگو و سس با مايکروفر": {
        name: "Microwave Shrimp & Sauce",
        description: "Shrimp and sauce cooked in a microwave."
    },
    "خوراک مرغ مکزيکي با مايکروفر": {
        name: "Microwave Mexican Chicken",
        description: "Mexican chicken cooked in a microwave."
    },
    "طبخ ساده مرغ با مايکروفر": {
        name: "Simple Microwave Chicken",
        description: "Simple chicken recipe for microwave."
    },
    "طبخ ماهي با مايکروفر": {
        name: "Microwave Fish",
        description: "Fish cooked in a microwave."
    },
    "سس خامه با مايکروفر": {
        name: "Microwave Cream Sauce",
        description: "Cream sauce made in a microwave."
    },
    "سس گوجه فرنگي با مايکروفر": {
        name: "Microwave Tomato Sauce",
        description: "Tomato sauce made in a microwave."
    },
    "سس سفيد با مايکروفر": {
        name: "Microwave White Sauce",
        description: "White sauce made in a microwave."
    },
    "نکات مهم در تهيه سس با مايکروفر": {
        name: "Microwave Sauce Tips",
        description: "Tips for making sauces in a microwave."
    },
    "چلوي ساده با مايکروفر": {
        name: "Microwave Steamed Rice",
        description: "Steamed rice cooked in a microwave."
    },
    "خورش قارچ با مايکروفر": {
        name: "Microwave Mushroom Stew",
        description: "Mushroom stew cooked in a microwave."
    },
    "فسنجان با مايکروفر": {
        name: "Microwave Fesenjan",
        description: "Fesenjan stew cooked in a microwave."
    },
    "سوپ قارچ با مايکروفر": {
        name: "Microwave Mushroom Soup",
        description: "Mushroom soup cooked in a microwave."
    },
    "پتاژ جو يا برنج با مايکروفر": {
        name: "Microwave Barley or Rice Potage",
        description: "Potage made with barley or rice in a microwave."
    },
    "سوپ سبزي با ماکروفر": {
        name: "Microwave Vegetable Soup",
        description: "Vegetable soup cooked in a microwave."
    },
    "کوکو سبزي با ماکروفر": {
        name: "Microwave Herb Kookoo",
        description: "Herb frittata cooked in a microwave."
    },
    "املت قارچ با مايکروفر": {
        name: "Microwave Mushroom Omelet",
        description: "Mushroom omelet cooked in a microwave."
    },
    "نيمرو با مايکروفر": {
        name: "Microwave Fried Egg",
        description: "Fried egg cooked in a microwave."
    },
    "خاگينه با مايکرو فر": {
        name: "Microwave Khagineh",
        description: "Sweet omelet cooked in a microwave."
    },
    "برانی کدو": {
        name: "Zucchini Borani",
        description: "Yogurt dip with zucchini."
    },
    "سمبوسه هندی با ماهی": {
        name: "Indian Fish Samosa",
        description: "Samosa filled with fish Indian style."
    },
    "خوراك سيب زميني با اسفناج": {
        name: "Potato & Spinach Dish",
        description: "Dish made with potatoes and spinach."
    },
    "گوره ماست": {
        name: "Goreh Mast",
        description: "Traditional yogurt dish."
    },
    "پلو توپي": {
        name: "Ball Rice",
        description: "Rice shaped into balls."
    },
    "باقلای بهاره": {
        name: "Spring Fava Beans",
        description: "Fresh spring fava beans."
    },
    "خوراک بامیه": {
        name: "Okra Dish",
        description: "Dish made with okra."
    },
    "رولت سبزی": {
        name: "Vegetable Roll",
        description: "Roll filled with vegetables."
    },
    "خوراک قالبی سبزیجات": {
        name: "Molded Vegetable Dish",
        description: "Vegetable dish served in a mold."
    },
    "خوراک مخلوط سبزیجات": {
        name: "Mixed Vegetable Dish",
        description: "Dish made with mixed vegetables."
    },
    "تارت كوچک سبزيجات": {
        name: "Mini Vegetable Tart",
        description: "Small tart filled with vegetables."
    },
    "پيراشکی اسفناج": {
        name: "Spinach Pirozhki",
        description: "Pastry filled with spinach."
    },
    "اسنک عدس - 2": {
        name: "Lentil Snack (Variation)",
        description: "Another variation of lentil snack."
    },
    "خوراک تند با لوبیا": {
        name: "Spicy Bean Dish",
        description: "Spicy dish made with beans."
    },
    "خوراک رنگی سبزیجات": {
        name: "Colorful Vegetable Dish",
        description: "Dish made with colorful vegetables."
    },
    "خوراک کدو با پنیر فتا": {
        name: "Zucchini with Feta Cheese",
        description: "Zucchini dish served with feta cheese."
    },
    "خوراک کدو": {
        name: "Zucchini Dish",
        description: "Simple zucchini dish."
    },
    "خوراک لوبیا سبز با سس مخصوص": {
        name: "Green Beans with Special Sauce",
        description: "Green beans served with a special sauce."
    },
    "خوراک سیب زمینی با گردو": {
        name: "Potato with Walnut",
        description: "Potato dish with walnuts."
    },
    "سیب ‌زمینی با پنیر": {
        name: "Potato with Cheese",
        description: "Potatoes topped with cheese."
    },
    "کشک بادنجان رژیمی": {
        name: "Diet Kashk Bademjan",
        description: "Low-fat eggplant dip with whey."
    },
    "خوراک بادمجان و پنیر": {
        name: "Eggplant & Cheese Dish",
        description: "Eggplant dish with cheese."
    },
    "خوراک لوبیاسبز با گردو": {
        name: "Green Bean & Walnut Dish",
        description: "Green beans served with walnuts."
    },
    "سبزیجات پخته با عسل": {
        name: "Honey Glazed Vegetables",
        description: "Cooked vegetables glazed with honey."
    },
    "خوراک فوری سبزیجات": {
        name: "Instant Vegetable Dish",
        description: "Quick and easy vegetable dish."
    },
    "نان سبزيجات": {
        name: "Vegetable Bread",
        description: "Bread made with vegetables."
    },
    "خوراک اسفناج و کالباس": {
        name: "Spinach & Ham Dish",
        description: "Dish made with spinach and ham."
    },
    "خوراک تند لوبیا سفید": {
        name: "Spicy White Bean Stew",
        description: "Spicy stew made with white beans."
    },
    "کوکوی خانم جان": {
        name: "Grandma's Kookoo",
        description: "Traditional style kookoo."
    },
    "کباب فلفلی": {
        name: "Pepper Kebab",
        description: "Spicy pepper kebab."
    },
    "مرغ بریان": {
        name: "Roasted Chicken",
        description: "Whole roasted chicken."
    },
    "ران کبابی مرغ با رزماری": {
        name: "Grilled Chicken Thighs with Rosemary",
        description: "Chicken thighs grilled with rosemary."
    },
    "مرغ کبابی تند": {
        name: "Spicy Grilled Chicken",
        description: "Spicy marinated grilled chicken."
    },
    "فیله تند سرخ شده": {
        name: "Spicy Fried Fillet",
        description: "Fried fish or chicken fillet with spices."
    },
    "برگر بدون نان": {
        name: "Bun-less Burger",
        description: "Burger served without a bun."
    },
    "چلوکباب کوبیده مخصوص": {
        name: "Special Chelo Kebab Koobideh",
        description: "Special ground meat kebab with rice."
    },
    "کباب جوجه تابه ای": {
        name: "Pan-Fried Chicken Kebab",
        description: "Chicken kebab cooked in a pan."
    },
    "کباب ویژه": {
        name: "Special Kebab",
        description: "Chef's special kebab."
    },
    "پخت همبرگر به وسیله مایکروفر": {
        name: "Microwave Hamburger",
        description: "Hamburger cooked in a microwave."
    },
    "کوفته کرمانی": {
        name: "Kermani Meatball",
        description: "Traditional meatball from Kerman."
    },
    "نان گوشتی": {
        name: "Meat Bread",
        description: "Bread stuffed with meat."
    },
    "کتلت با خمیر نان باگت": {
        name: "Cutlet with Baguette Dough",
        description: "Cutlet made using baguette dough."
    },
    "کوفته باقلا سبز": {
        name: "Fava Bean Meatball",
        description: "Meatball made with fava beans."
    },
    "کوفته کاسه ای": {
        name: "Bowl Meatball",
        description: "Large meatball served in a bowl."
    },
    "کوفته ترخان": {
        name: "Tarkhan Meatball",
        description: "Traditional Tarkhan meatball."
    },
    "کتلت مرغ با پنیر": {
        name: "Chicken & Cheese Cutlet",
        description: "Chicken cutlet with cheese."
    },
    "شامی لپه": {
        name: "Split Pea Shami",
        description: "Shami kebab made with split peas."
    },
    "شامي نخودچي": {
        name: "Chickpea Flour Shami",
        description: "Shami made with chickpea flour."
    },
    "ترشی شامی": {
        name: "Sour Shami",
        description: "Shami served with sour sauce."
    },
    "کوفته روسی": {
        name: "Russian Meatball",
        description: "Russian style meatball."
    },
    "کوفته رژیمی": {
        name: "Diet Meatball",
        description: "Low-fat meatball."
    },
    "شامی المپیک": {
        name: "Olympic Shami",
        description: "Special Shami kebab."
    },
    "کتلت گرد غوره": {
        name: "Unripe Grape Powder Cutlet",
        description: "Cutlet flavored with unripe grape powder."
    },
    "کتلت سیب زمینی": {
        name: "Potato Cutlet",
        description: "Cutlet made with potatoes."
    },
    "کوفته ریزه مرغ": {
        name: "Small Chicken Meatballs",
        description: "Tiny meatballs made with chicken."
    },
    "خورش مرغ و بادنجان": {
        name: "Chicken & Eggplant Stew",
        description: "Stew with chicken and eggplant."
    },
    "خورشت بامیه": {
        name: "Okra Stew",
        description: "Stew made with okra."
    },
    "خـورش نخود آله": {
        name: "Nokhod Aleh Stew",
        description: "Traditional stew from Kashan."
    },
    "خورش کاری 2": {
        name: "Curry Stew (Variation)",
        description: "Another variation of curry stew."
    },
    "خورشت کاری": {
        name: "Curry Stew",
        description: "Stew flavored with curry spices."
    },
    "خورش کاری نخود": {
        name: "Chickpea Curry Stew",
        description: "Curry stew with chickpeas."
    },
    "خورش میگو": {
        name: "Shrimp Stew",
        description: "Stew made with shrimp."
    },
    "خورش لوبیا قرمز": {
        name: "Red Bean Stew",
        description: "Stew made with red kidney beans."
    },
    "قیمه نساء": {
        name: "Gheimeh Nesa",
        description: "Traditional Gheimeh stew."
    },
    "قیمه پیچاق": {
        name: "Gheimeh Pichagh",
        description: "Almond stew from Ardabil."
    },
    "قيمه محلی": {
        name: "Local Gheimeh",
        description: "Local variation of Gheimeh stew."
    },
    "خورشت گزنه": {
        name: "Nettle Stew",
        description: "Stew made with nettles."
    },
    "خورش زرشک": {
        name: "Barberry Stew",
        description: "Stew made with fresh barberries."
    },
    "خورش کلم": {
        name: "Cabbage Stew",
        description: "Stew made with cabbage."
    },
    "خورش بامیه با تمر هندی": {
        name: "Okra Stew with Tamarind",
        description: "Okra stew flavored with tamarind."
    },
    "خورشت بلدرچین با سس پرتقال": {
        name: "Quail Stew with Orange Sauce",
        description: "Quail stew served with orange sauce."
    },
    "خورش گل کلم": {
        name: "Cauliflower Stew",
        description: "Stew made with cauliflower."
    },
    "خورشت به و آلو": {
        name: "Quince & Plum Stew",
        description: "Stew with quince and plums."
    },
    "خورش بامیه و بادمجان": {
        name: "Okra & Eggplant Stew",
        description: "Stew with okra and eggplant."
    },
    "خورش آلبالو": {
        name: "Sour Cherry Stew",
        description: "Stew made with sour cherries."
    },
    "خورش کرفس مینیاتوری": {
        name: "Miniature Celery Stew",
        description: "Stew with small celery stalks."
    },
    "خورش خلال کرمانشاه": {
        name: "Kermanshah Almond Stew",
        description: "Traditional almond sliver stew from Kermanshah."
    },
    "خورش بادمجان مجلسی": {
        name: "Formal Eggplant Stew",
        description: "Elaborate eggplant stew for parties."
    },
    "خورش ترشه سماق": {
        name: "Sour Sumac Stew",
        description: "Stew flavored with sumac."
    },
    "خورش پرتقال": {
        name: "Orange Stew",
        description: "Stew made with oranges."
    },
    "دال عدس": {
        name: "Dal Lentil",
        description: "Spicy red lentil dish."
    },
    "برگر گیاهخواران": {
        name: "Veggie Burger",
        description: "Burger made with vegetarian ingredients."
    },
    "خوراک بادنجان و کدو": {
        name: "Eggplant & Zucchini Stew",
        description: "Stew with eggplant and zucchini."
    },
    "پودینگ هویج و برنج": {
        name: "Carrot & Rice Pudding",
        description: "Sweet pudding made with carrots and rice."
    },
    "كتلت گیاهی": {
        name: "Vegetarian Cutlet",
        description: "Cutlets made with mixed vegetables."
    },
    "گل کلم به سبک یونانی": {
        name: "Greek Style Cauliflower",
        description: "Cauliflower prepared Greek style."
    },
    "خاویار بادنجان": {
        name: "Eggplant Caviar",
        description: "Roasted eggplant dip."
    },
    "فلفل فرنگی با سس": {
        name: "Bell Pepper with Sauce",
        description: "Bell peppers served with a savory sauce."
    },
    "سوپ کلم یونانی": {
        name: "Greek Cabbage Soup",
        description: "Cabbage soup Greek style."
    },
    "املت اسفناج": {
        name: "Spinach Omelet",
        description: "Omelet made with fresh spinach."
    },
    "نکاتی برای گیاهخواران": {
        name: "Tips for Vegetarians",
        description: "Cooking tips for vegetarian diets."
    },
    "برشت سرد لهستاني": {
        name: "Polish Cold Borscht",
        description: "Cold beet soup Polish style."
    },
    "قيمه گياهخواري": {
        name: "Vegetarian Gheimeh",
        description: "Vegetarian version of Gheimeh stew."
    },
    "لازانياي سبزيجات": {
        name: "Vegetable Lasagna",
        description: "Lasagna filled with vegetables."
    },
    "بادنجان و كدوي توپر": {
        name: "Stuffed Eggplant & Zucchini",
        description: "Eggplant and zucchini stuffed with filling."
    },
    "خوراك كدو حلوايی": {
        name: "Pumpkin Stew",
        description: "Stew made with sweet pumpkin."
    },
    "رولت اسفناج همراه با سس لیمو": {
        name: "Spinach Roll with Lemon Sauce",
        description: "Spinach roll served with zesty lemon sauce."
    },
    "صبحار زیتون": {
        name: "Olive Breakfast",
        description: "Olive-based breakfast dish."
    },
    "تهيه اردور با تخم مرغ": {
        name: "Egg Appetizer",
        description: "Appetizer made with eggs."
    },
    "پيراشكي پنير": {
        name: "Cheese Pirozhki",
        description: "Pastry filled with cheese."
    },
    "پيتزاي سبزي": {
        name: "Vegetable Pizza",
        description: "Pizza topped with mixed vegetables."
    },
    "كوكوي كدو سبز": {
        name: "Zucchini Kookoo",
        description: "Frittata made with zucchini."
    },
    "سالاد ذرت": {
        name: "Corn Salad",
        description: "Salad made with sweet corn."
    },
    "كوكوي سبزيجات": {
        name: "Vegetable Kookoo",
        description: "Frittata made with mixed vegetables."
    },
    "دلمه برگ مو بدون گوشت": {
        name: "Vegetarian Grape Leaves",
        description: "Stuffed grape leaves without meat."
    },
    "يك نوع کباب گياهي": {
        name: "Vegetarian Kebab Variation",
        description: "A variation of vegetarian kebab."
    },
    "رولت سبزي": {
        name: "Herb Roll",
        description: "Roll filled with fresh herbs."
    },
    "خورش ماست و تخم مرغ به شیوه ی هندی": {
        name: "Indian Yogurt & Egg Stew",
        description: "Indian style stew with yogurt and eggs."
    },
    "آش شلي": {
        name: "Ash Sholi",
        description: "Traditional thick soup."
    },
    "رشته پلوقيسي": {
        name: "Reshteh Polo with Apricots",
        description: "Noodle rice with dried apricots."
    },
    "اردور سیب زمینی مخصوص": {
        name: "Special Potato Appetizer",
        description: "Special appetizer made with potatoes."
    },
    "اردور ژامبون مرغ و گوشت": {
        name: "Chicken & Meat Ham Appetizer",
        description: "Appetizer with chicken and meat ham."
    },
    "اردور سبزیجات": {
        name: "Vegetable Appetizer",
        description: "Appetizer made with fresh vegetables."
    },
    "اردور قارچ - 2": {
        name: "Mushroom Appetizer (Variation)",
        description: "Another variation of mushroom appetizer."
    },
    "اردور پنیر": {
        name: "Cheese Appetizer",
        description: "Appetizer made with cheese."
    },
    "اردور میگو": {
        name: "Shrimp Appetizer",
        description: "Appetizer made with shrimp."
    },
    "سینی کاناپه": {
        name: "Canape Platter",
        description: "Platter of assorted canapes."
    },
    "سیب زمینی و پنیر طعم دار": {
        name: "Flavored Potato & Cheese",
        description: "Potatoes and cheese with special seasoning."
    },
    "اردور بامیه": {
        name: "Okra Appetizer",
        description: "Appetizer made with okra."
    },
    "سيني اردور": {
        name: "Appetizer Platter",
        description: "Platter of mixed appetizers."
    },
    "اردور آقا كوچولو با گوجه فرنگي": {
        name: "Little Gentleman Appetizer",
        description: "Fun appetizer with tomatoes."
    },
    "اردور خيار و ميگو": {
        name: "Cucumber & Shrimp Appetizer",
        description: "Appetizer with cucumber and shrimp."
    },
    "اردور خيار": {
        name: "Cucumber Appetizer",
        description: "Simple cucumber appetizer."
    },
    "اردور گوجه فرنگي": {
        name: "Tomato Appetizer",
        description: "Appetizer made with tomatoes."
    },
    "اردور تن ماهي و تخم مرغ سفت": {
        name: "Tuna & Hard Boiled Egg Appetizer",
        description: "Appetizer with tuna and eggs."
    },
    "شش نوع اردور ساده": {
        name: "Six Simple Appetizers",
        description: "Collection of 6 simple appetizers."
    },
    "اردور كرفس": {
        name: "Celery Appetizer",
        description: "Appetizer made with celery."
    },
    "سيني اردور چهار خانه": {
        name: "Four-Section Appetizer Platter",
        description: "Platter with four types of appetizers."
    },
    "اردور اسفناج": {
        name: "Spinach Appetizer",
        description: "Appetizer made with spinach."
    },
    "سيني اردور متفاوت": {
        name: "Unique Appetizer Platter",
        description: "A unique selection of appetizers."
    },
    "پلوی چشم‌بلبلی با کوفته ریزه": {
        name: "Black-Eyed Pea Rice with Meatballs",
        description: "Rice with black-eyed peas and small meatballs."
    },
    "ته‌چین اسفناج": {
        name: "Spinach Tahchin",
        description: "Saffron rice cake with spinach."
    },
    "ته چین، غذای ایرانی": {
        name: "Tahchin (Persian Rice Cake)",
        description: "Classic Persian saffron rice cake."
    },
    "دمی عدس و هویج": {
        name: "Lentil & Carrot Dami",
        description: "Rice steamed with lentils and carrots."
    },
    "فلفل‌پلو با مرغ": {
        name: "Pepper Rice with Chicken",
        description: "Rice with bell peppers and chicken."
    },
    "چلوکباب ترخونی": {
        name: "Tarragon Kebab Rice",
        description: "Rice served with tarragon-flavored kebab."
    },
    "عدس پلو با سس مرغ": {
        name: "Lentil Rice with Chicken Sauce",
        description: "Lentil rice served with chicken sauce."
    },
    "اسفناج پلو": {
        name: "Spinach Rice",
        description: "Rice cooked with spinach."
    },
    "پلوی لوبیا قرمز": {
        name: "Red Bean Rice",
        description: "Rice cooked with red kidney beans."
    },
    "پلو قبولی": {
        name: "Ghabouli Polo",
        description: "Traditional rice dish with meat and chickpeas."
    },
    "دمی بادمجان": {
        name: "Eggplant Dami",
        description: "Rice steamed with eggplant."
    },
    "اسفناج پلوی هندی": {
        name: "Indian Spinach Rice",
        description: "Spicy Indian style spinach rice."
    },
    "رشته‌پلو با لوبیا چشم‌بلبلی": {
        name: "Reshteh Polo with Black-Eyed Peas",
        description: "Noodle rice with black-eyed peas."
    },
    "هویج پلو": {
        name: "Carrot Rice",
        description: "Sweet and savory rice with carrots."
    },
    "ته‌چین گوشت و بادمجان": {
        name: "Meat & Eggplant Tahchin",
        description: "Tahchin with meat and eggplant layers."
    },
    "والک پلو": {
        name: "Valak Polo",
        description: "Rice cooked with Valak (wild mountain leek)."
    },
    "کلم پلو": {
        name: "Cabbage Rice",
        description: "Rice cooked with cabbage and herbs."
    },
    "شیرازی‌ پلو": {
        name: "Shirazi Polo",
        description: "Rice dish from Shiraz."
    },
    "ته چین مرغ در مایتابه": {
        name: "Pan Chicken Tahchin",
        description: "Chicken tahchin cooked in a pan."
    },
    "د‌م پختک باقلا خشک زرد": {
        name: "Yellow Fava Bean Dampokhtak",
        description: "Turmeric rice with dried yellow fava beans."
    },
    "غذای شب‌های عروسی": {
        name: "Wedding Night Feast",
        description: "Traditional celebratory rice dish."
    },
    "مرصع پلو": {
        name: "Jeweled Rice (Morasa Polo)",
        description: "Rice topped with nuts and dried fruits like jewels."
    },
    "سبزی پلو": {
        name: "Herb Rice",
        description: "Rice cooked with fresh herbs."
    },
    "لوبیا پلو": {
        name: "Green Bean Rice",
        description: "Rice with green beans and meat."
    },
    "عدس پلو": {
        name: "Lentil Rice",
        description: "Rice with lentils and raisins."
    },
    "شکر پلو": {
        name: "Sugar Rice",
        description: "Sweet rice dish from Shiraz."
    },
    "ته چین مرغ یا بره": {
        name: "Chicken or Lamb Tahchin",
        description: "Tahchin made with chicken or lamb."
    },
    "پلو ( یا چلو)": {
        name: "Polo (Rice)",
        description: "Plain steamed rice."
    },
    "سوتی پلو": {
        name: "Sooti Polo",
        description: "Traditional rice dish."
    },
    "عدس پلو با قارچ": {
        name: "Lentil Rice with Mushrooms",
        description: "Lentil rice with sautéed mushrooms."
    },
    "زرشک پلو با مرغ": {
        name: "Barberry Rice with Chicken",
        description: "Classic saffron rice with barberries and chicken."
    },
    "کلم پلوی شیرازی": {
        name: "Shirazi Cabbage Rice",
        description: "Shirazi style cabbage rice with meatballs."
    },
    "پلومرغ سرخ شده": {
        name: "Fried Chicken Rice",
        description: "Rice served with fried chicken."
    },
    "میگو پلو": {
        name: "Shrimp Rice",
        description: "Rice cooked with shrimp."
    },
    "آلبالو پلو": {
        name: "Sour Cherry Rice",
        description: "Sweet and sour rice with sour cherries."
    },
    "سبزی‌ پلو با ماهی": {
        name: "Herb Rice with Fish",
        description: "Traditional New Year's dish."
    },
    "باقلا پلو": {
        name: "Fava Bean Rice",
        description: "Rice with fava beans and dill."
    },
    "کته": {
        name: "Kateh",
        description: "Simple steamed rice."
    },
    "كوكوی كدو با هويج": {
        name: "Zucchini & Carrot Kookoo",
        description: "Frittata made with zucchini and carrots."
    },
    "رولهای برنجی": {
        name: "Rice Rolls",
        description: "Rolls filled with rice mixture."
    },
    "دلمه فلفل و بادمجان": {
        name: "Stuffed Pepper & Eggplant",
        description: "Peppers and eggplants stuffed with rice and meat."
    },
    "دلمه فلفل سبز": {
        name: "Stuffed Green Pepper",
        description: "Green peppers stuffed with savory filling."
    },
    "دلمه سه رنگ": {
        name: "Three-Color Dolma",
        description: "Stuffed peppers in three colors."
    },
    "کوکو بادمجان کبابی": {
        name: "Grilled Eggplant Kookoo",
        description: "Frittata made with grilled eggplant."
    },
    "کیک سیب زمینی": {
        name: "Potato Cake",
        description: "Savory cake made with potatoes."
    },
    "دلمه مرغ و برنج": {
        name: "Chicken & Rice Dolma",
        description: "Dolma filled with chicken and rice."
    },
    "دلمه برگ مو": {
        name: "Stuffed Grape Leaves",
        description: "Classic grape leaves stuffed with rice and herbs."
    },
    "دلمه آرتیشو": {
        name: "Stuffed Artichoke",
        description: "Artichokes stuffed with savory filling."
    },
    "نکات براي طخ غذا با مايکروفر": {
        name: "Microwave Cooking Tips",
        description: "Tips for cooking food in a microwave."
    },
    "خورش قارچ با مایکروفر": {
        name: "Mushroom Stew (Microwave)",
        description: "Mushroom stew cooked in a microwave."
    },
    "خورش آلو": {
        name: "Plum Stew",
        description: "Stew made with plums and meat/chicken."
    },
    "ته چين مرغ با مایکروویو": {
        name: "Chicken Tahchin (Microwave)",
        description: "Layered saffron rice and chicken cake cooked in a microwave."
    },
    "عدس پلو با مايكروويو": {
        name: "Lentil Rice (Microwave)",
        description: "Rice with lentils cooked in a microwave."
    },
    "استامبولي پلو با مايكروويو": {
        name: "Estamboli Polo (Microwave)",
        description: "Tomato rice with potatoes/meat cooked in a microwave."
    },
    "خورش فسنجان با مايكروويو": {
        name: "Fesenjan Stew (Microwave)",
        description: "Pomegranate walnut stew cooked in a microwave."
    },
    "ببرهای خوراکی": {
        name: "Edible Tigers (Kids Snack)",
        description: "Fun tiger-shaped snacks for children."
    },
    "خوراک کنسرو بادنجان": {
        name: "Canned Eggplant Stew",
        description: "Quick stew made with canned eggplant."
    },
    "کدو ورقه ای": {
        name: "Sliced Zucchini",
        description: "Fried or baked zucchini slices."
    },
    "نان سيب زمينی پنيری": {
        name: "Cheesy Potato Bread",
        description: "Bread made with potato dough and cheese."
    },
    "تن ماهی انگشتی": {
        name: "Fish Finger Tuna",
        description: "Finger-shaped snacks made with tuna."
    },
    "سيب زميني سرخ شده با ادويه كاری": {
        name: "Curry Fried Potatoes",
        description: "Fried potatoes seasoned with curry powder."
    },
    "روستی": {
        name: "Rosti",
        description: "Swiss potato dish."
    },
    "سیب زمینی شکم پر": {
        name: "Stuffed Potato",
        description: "Baked potato stuffed with fillings."
    },
    "خوارک قارچ با نان": {
        name: "Mushroom & Bread Stew",
        description: "Mushroom dish served with bread."
    },
    "چاپاتی عدس و اسفناج": {
        name: "Lentil & Spinach Chapati",
        description: "Flatbread filled with lentils and spinach."
    },
    "پيراشكي سبزيجات": {
        name: "Vegetable Pirozhki",
        description: "Pastry filled with mixed vegetables."
    },
    "کاناپس تن و ذرت": {
        name: "Tuna & Corn Canapes",
        description: "Small appetizers with tuna and corn."
    },
    "کدوی درون پر": {
        name: "Stuffed Zucchini",
        description: "Zucchini hollowed out and stuffed."
    },
    "کدو مخلوط": {
        name: "Mixed Zucchini Dish",
        description: "Dish made with zucchini and other ingredients."
    },
    "اسنک هلندی": {
        name: "Dutch Snack",
        description: "Dutch-style snack."
    },
    "اسنک سویا و بادمجان": {
        name: "Soy & Eggplant Snack",
        description: "Snack made with soy protein and eggplant."
    },
    "خوراک لوبیا سبز گرم": {
        name: "Warm Green Bean Stew",
        description: "Warm dish made with green beans."
    },
    "خوراک کدو با ماست": {
        name: "Zucchini with Yogurt",
        description: "Zucchini dish served with yogurt."
    },
    "خوراک بادمجان با پنیر مازارولا": {
        name: "Eggplant with Mozzarella",
        description: "Eggplant topped with mozzarella cheese."
    },
    "تن ماهی با رشته": {
        name: "Tuna with Noodles",
        description: "Noodle dish with tuna."
    },
    "رولت اسفناج": {
        name: "Spinach Roll",
        description: "Rolled pastry or omelet with spinach."
    },
    "غذای ساده با رشته سوپی": {
        name: "Simple Noodle Soup",
        description: "Simple soup made with vermicelli."
    },
    "خاگینه کالباس": {
        name: "Sausage Khagineh",
        description: "Omelet-style dish with sausage."
    },
    "خوراک لوبیا سبز و کالباس": {
        name: "Green Bean & Sausage Stew",
        description: "Stew with green beans and sausage."
    },
    "خوراک سبزیجات با سس مخصوص": {
        name: "Vegetables with Special Sauce",
        description: "Mixed vegetables served with a special sauce."
    },
    "خوراک لوبیا چشم بلبلی با کالباس": {
        name: "Black-Eyed Pea & Sausage Stew",
        description: "Stew with black-eyed peas and sausage."
    },
    "خوراک لوبیای سفید و کرفس": {
        name: "White Bean & Celery Stew",
        description: "Stew made with white beans and celery."
    },
    "خوراک گرم لوبیا": {
        name: "Warm Bean Stew",
        description: "Warm stew made with mixed beans."
    },
    "سینی سبزیجات": {
        name: "Vegetable Platter",
        description: "Platter of assorted vegetables."
    },
    "خوراک بادمجان با زیتون": {
        name: "Eggplant & Olive Stew",
        description: "Stew with eggplant and olives."
    },
    "سیب زمینی تنوری بازاری با سس مخصوص": {
        name: "Market Style Baked Potato",
        description: "Baked potato served with a special sauce."
    },
    "تخم مرغ پر شده با مایونز": {
        name: "Deviled Eggs with Mayo",
        description: "Hard-boiled eggs filled with yolk and mayo."
    },
    "املت تخم مرغ با ذرت": {
        name: "Corn Omelet",
        description: "Omelet made with corn."
    },
    "کتلت میگو": {
        name: "Shrimp Cutlet",
        description: "Cutlets made with shrimp."
    },
    "خوراک سیب زمینی با بشامل": {
        name: "Potato with Bechamel",
        description: "Potato dish topped with bechamel sauce."
    },
    "میرزا قاسمی با کدو خورشی": {
        name: "Mirza Ghasemi with Zucchini",
        description: "Variant of Mirza Ghasemi using zucchini."
    },
    "متبل ایرانی": {
        name: "Iranian Mutabal",
        description: "Iranian style eggplant dip."
    },
    "نان تست با کنجد(بسیارلذیذ)": {
        name: "Sesame Toast",
        description: "Toast topped with sesame seeds."
    },
    "فلافل خوزستانی": {
        name: "Khuzestani Falafel",
        description: "Falafel style from Khuzestan."
    },
    "پودینگ سیب زمینی": {
        name: "Potato Pudding",
        description: "Savory pudding made with potatoes."
    },
    "املت کالباس": {
        name: "Sausage Omelet",
        description: "Omelet made with sausage."
    },
    "غذا با تن ماهی": {
        name: "Tuna Dish",
        description: "Dish made with tuna fish."
    },
    "پکورا ی سیب زمینی": {
        name: "Potato Pakora",
        description: "Fried potato fritters."
    },
    "توپ مرغ و پنیر": {
        name: "Chicken & Cheese Ball",
        description: "Fried balls of chicken and cheese."
    },
    "ذرت مکزیکی": {
        name: "Mexican Corn",
        description: "Corn snack with mayo, cheese, and spices."
    },
    "اسنک عدس": {
        name: "Lentil Snack",
        description: "Snack made with lentils."
    },
    "دمی زیره بادنجان": {
        name: "Cumin & Eggplant Rice",
        description: "Rice dish with cumin and eggplant."
    },
    "شامی سویا": {
        name: "Soy Shami",
        description: "Shami kebab made with soy protein."
    },
    "قلیه کدو حلوایی": {
        name: "Pumpkin Ghalieh",
        description: "Stew made with pumpkin."
    },
    "استریپس سیب زمینی": {
        name: "Potato Strips",
        description: "Fried strips of potato mixture."
    },
    "لوبیا پلو با سویا": {
        name: "Green Bean Rice with Soy",
        description: "Rice with green beans and soy protein."
    },
    "املت گوجه فرنگی و تن": {
        name: "Tomato & Tuna Omelet",
        description: "Omelet with tomato and tuna."
    },
    "چیپس وپنیر فیله مرغ": {
        name: "Chips & Cheese with Chicken Fillet",
        description: "Chips and cheese topped with chicken fillet."
    },
    "چیپس و پنیر (پیش غذا)": {
        name: "Chips & Cheese (Appetizer)",
        description: "Simple chips and cheese appetizer."
    },
    "املت گوشت و تخم مرغ": {
        name: "Meat & Egg Omelet",
        description: "Omelet made with minced meat."
    },
    "سمبوسه با اسفناج(عربی)": {
        name: "Spinach Samosa (Arabic)",
        description: "Arabic style samosa filled with spinach."
    },
    "قارچ با کرم": {
        name: "Mushroom with Cream",
        description: "Mushrooms cooked in cream sauce."
    },
    "کدو چیپس(پیش غذا)": {
        name: "Zucchini Chips",
        description: "Fried zucchini chips."
    },
    "پنکیک کدو": {
        name: "Zucchini Pancake",
        description: "Pancakes made with zucchini."
    },
    "خوراک سبزیجات لذیذ": {
        name: "Delicious Vegetable Stew",
        description: "A tasty stew of mixed vegetables."
    },
    "املت": {
        name: "Omelet",
        description: "Classic egg omelet."
    },
    "دلمه فلفل گیاهی": {
        name: "Vegetarian Stuffed Pepper",
        description: "Stuffed peppers with vegetarian filling."
    },
    "الحمص": {
        name: "Hummus",
        description: "Chickpea dip."
    },
    "قارچ سوخاری": {
        name: "Fried Mushrooms",
        description: "Breaded and fried mushrooms."
    },
    "خوراک بادمجان وکدو": {
        name: "Eggplant & Zucchini Stew",
        description: "Stew with eggplant and zucchini."
    },
    "توپ پنیر و زیتون": {
        name: "Cheese & Olive Ball",
        description: "Appetizer balls made of cheese and olives."
    },
    "خوراک سیرابی": {
        name: "Tripe Stew",
        description: "Stew made with sheep tripe."
    },
    "پلوی لوبيا با کوفته ريزه": {
        name: "Bean Rice with Meatballs",
        description: "Rice with beans served with small meatballs."
    },
    "دلمه قارچ با پنیر": {
        name: "Stuffed Mushroom with Cheese",
        description: "Mushrooms stuffed with cheese."
    },
    "شیرین‌پلو با عدس‌ و كشمش‌": {
        name: "Sweet Lentil Rice",
        description: "Sweet rice with lentils, raisins, candied orange peel, and almonds."
    },
    "پودینگ‌ برنج‌": {
        name: "Rice Pudding",
        description: "Creamy rice pudding with milk, vanilla, and grape syrup."
    },
    "پلومیگو": {
        name: "Shrimp Rice (Polo Meigoo)",
        description: "Rice layered with spicy shrimp and fresh herbs."
    },
    "پلوی‌ شیرین‌ زعفرانی‌": {
        name: "Sweet Saffron Rice",
        description: "A sweet and aromatic saffron rice dish with raisins and nuts."
    },
    "برنج‌ با مخلوط سبزیجات‌": {
        name: "Rice with Mixed Vegetables",
        description: "Baked rice dish with eggplant, cheese, and mixed vegetables."
    },
    "پلو چینی": {
        name: "Chinese Fried Rice",
        description: "Chinese style rice with soy sauce, vegetables, and cashews."
    },
    "زرشک پلو قاطی": {
        name: "Mixed Barberry Rice",
        description: "Rice mixed with barberries and chicken, cooked together."
    },
    "پلو توپی": {
        name: "Rice Balls",
        description: "Fried rice balls stuffed with cheese and herbs."
    },
    "چلوی ساده": {
        name: "Plain Rice (Chelo)",
        description: "Classic Persian steamed white rice with a golden crust (Tahdig)."
    },
    "ماش پلو": {
        name: "Mung Bean Rice",
        description: "Rice cooked with mung beans and minced meat."
    },
    "بره پلو": {
        name: "Lamb Rice",
        description: "Rice cooked with tender lamb, raisins, and almonds."
    },
    "پلو سه رنگ": {
        name: "Three Color Rice",
        description: "A colorful rice dish with layers of vegetables and herbs."
    },
    "چلو خورشت جگر مرغ": {
        name: "Chicken Liver Stew with Rice",
        description: "Rice served with a savory chicken liver and tomato sauce stew."
    },
    "پلو اروپائی": {
        name: "European Style Rice",
        description: "Rice served with a mix of chicken/shrimp, peppers, and curry sauce."
    },
    "کته قالبی با مرغ": {
        name: "Molded Chicken Rice",
        description: "Molded rice cake (Kateh) filled with chicken and bananas."
    },
    "پلو با قارچ ایتالیا": {
        name: "Italian Mushroom Rice",
        description: "Rice cooked with veal, mushrooms, and bell peppers."
    },
    "مصالح پلو": {
        name: "Spiced Meatball Rice",
        description: "Rice served with spiced meatballs (Shami) and saffron."
    },
    "کبک پلو": {
        name: "Partridge Rice",
        description: "Traditional rice dish cooked with partridge meat and cumin."
    },
    "کلم قمری پلو": {
        name: "Kohlrabi Rice",
        description: "Rice cooked with kohlrabi, meatballs, and saffron."
    },
    "کاری پلو": {
        name: "Curry Rice",
        description: "Rice flavored with curry powder, served with chicken and peas."
    },
    "قورمه سبزی پلو": {
        name: "Ghormeh Sabzi Rice",
        description: "Rice layered with the famous Ghormeh Sabzi herb and meat mixture."
    },
    "کته قالبی با کباب حسینی": {
        name: "Rice with Kabab Hosseini",
        description: "Molded rice served with skewered Kabab Hosseini."
    },
    "قیمه پلو": {
        name: "Gheimeh Rice",
        description: "Rice layered with Gheimeh stew (meat and split peas)."
    },
    "پلو به طریقه پرتغالی": {
        name: "Portuguese Rice",
        description: "Rice cooked with tomato, peppers, and meat broth."
    },
    "چلو به طریقه ایتالیائی فلورانس": {
        name: "Florentine Rice",
        description: "Italian style rice with chicken liver, parmesan, and sage."
    },
    "نکاتی برای تهیه پلو و چلو": {
        name: "Tips for Perfect Rice",
        description: "Essential tips and techniques for cooking perfect Persian rice."
    },
    "کلم پلو به طریقه آمریکائی": {
        name: "American Cabbage Rice",
        description: "Rice cooked with red cabbage, raisins, and olive oil."
    },
    "دلمه سوسیس و آلو": {
        name: "Sausage & Prune Dolma",
        description: "Sausages stuffed with prunes and wrapped in ham."
    },
    "گارنی ياريخ": {
        name: "Garni Yarik (Stuffed Eggplant)",
        description: "Fried eggplants stuffed with spiced ground meat and herbs."
    },
    "بادنجان چینی": {
        name: "Chinese Stuffed Eggplant",
        description: "Eggplants stuffed with meat, mushrooms, and barberries."
    },
    "دلمه فلفل دلمه ای": {
        name: "Stuffed Bell Peppers",
        description: "Bell peppers stuffed with meat, rice, and herbs."
    },
    "دلمه بادنجان با سس پنیر": {
        name: "Eggplant Dolma with Cheese",
        description: "Eggplants stuffed with chicken and topped with a creamy cheese sauce."
    },
    "دلمه بادنجان بقچه ای": {
        name: "Eggplant Bundles",
        description: "Eggplant slices wrapped around a meat filling like a bundle."
    },
    "پیاز شکم پر": {
        name: "Stuffed Onions",
        description: "Onions stuffed with rice, cheese, and spices, baked in foil."
    },
    "دلمه کباب": {
        name: "Cabbage Roll Kabab",
        description: "Cabbage leaves rolled around a meat filling and cooked in broth."
    },
    "کوکوی عدس": {
        name: "Lentil Kookoo",
        description: "A Persian frittata made with cooked lentils and eggs."
    },
    "کوکو سیب زمینی در فر": {
        name: "Baked Potato Kookoo",
        description: "Potato frittata baked in the oven until golden."
    },
    "کوکو دو رنگ": {
        name: "Two-Color Kookoo",
        description: "A layered kookoo with one layer of potato and one layer of herbs."
    },
    "کوکو استامبولی": {
        name: "Estamboli Kookoo",
        description: "Kookoo made with potatoes, beans, and cheese."
    },
    "دلمه کلم برگ": {
        name: "Stuffed Cabbage Rolls",
        description: "Cabbage leaves stuffed with meat, rice, and prunes."
    },
    "دلمه تخم مرغ": {
        name: "Stuffed Eggs",
        description: "Hard-boiled eggs stuffed with a seasoned yolk mixture."
    },
    "دلمه لواش": {
        name: "Lavash Rolls",
        description: "Lavash bread rolled with a rice and meat filling, topped with cheese."
    },
    "كوكوی ذرت": {
        name: "Corn Kookoo",
        description: "A savory fritter made with corn, flour, and spices."
    },
    "دلمه کدو ایتالیایی": {
        name: "Italian Stuffed Zucchini",
        description: "Zucchini stuffed with meat and topped with breadcrumbs and cheese."
    },
    "کوکو مرغ": {
        name: "Chicken Kookoo",
        description: "A delicious frittata made with ground chicken and saffron."
    },
    "دلمه مرغ و كرفس و قارچ": {
        name: "Chicken & Celery Dolma",
        description: "Chicken breast stuffed with celery and mushrooms."
    },
    "کوکوی شیر و گوشت": {
        name: "Milk & Meat Kookoo",
        description: "A rich kookoo made with milk, cheese, bread, and chicken."
    },
    "کوکوی جوانه": {
        name: "Sprout Kookoo",
        description: "Healthy kookoo made with mung bean sprouts and vegetables."
    },
    "کوکوی گوجه فرنگی": {
        name: "Tomato Kookoo",
        description: "A unique kookoo made with tomato puree and chickpea flour."
    },
    "کوکوي اسفناج": {
        name: "Spinach Kookoo",
        description: "Healthy frittata made with fresh spinach and walnuts."
    },
    "همبرگر با سویا": {
        name: "Soy Burger",
        description: "Vegetarian burger patties made with soy protein."
    },
    "پاستا با سس آلفردو و مرغ": {
        name: "Chicken Alfredo Pasta",
        description: "Rich and creamy pasta with tender chicken breast.",
        ingredients: [
            "Pasta - 500g",
            "Butter - 1/2 cup",
            "Chicken Breast, cooked and cubed - 300g",
            "Heavy Cream - 1 cup",
            "Garlic, minced - 1 clove",
            "Parmesan Cheese - 1.5 cups",
            "Fresh Parsley - 1/4 cup",
            "Salt and Pepper - to taste"
        ],
        instructions: [
            "Boil pasta in salted water until al dente. Drain.",
            "In a pan, melt butter and sauté the cooked chicken briefly.",
            "Add cream and simmer for 5 minutes.",
            "Stir in garlic, parmesan cheese, and parsley. Cook until sauce thickens.",
            "Toss the pasta with the sauce and serve hot."
        ]
    }
};

export const translateRecipeWithAI = async (recipe) => {
    if (!recipe) return null;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // If no API key, use the mock fallback (for demo/offline/no-key scenarios)
    if (!apiKey) {
        console.warn("OpenAI API Key not found (VITE_OPENAI_API_KEY). Using fallback translation.");
        return new Promise((resolve) => {
            setTimeout(() => {
                // 1. Check Dictionary
                const dbResult = translationDB[recipe.name];
                if (dbResult && dbResult.ingredients && dbResult.ingredients.length > 0) {
                    resolve(dbResult);
                    return;
                }

                // If DB has partial result (name/desc only), use it as base
                const baseTranslation = dbResult || {
                    name: `${recipe.name} (English)`,
                    description: `English translation for ${recipe.name}.`
                };

                // 2. Smart Fallback
                const commonTerms = {
                    "نمک": "Salt", "فلفل": "Pepper", "زردچوبه": "Turmeric", "پیاز": "Onion",
                    "سیر": "Garlic", "روغن": "Oil", "گوشت": "Meat", "مرغ": "Chicken",
                    "آب": "Water", "تخم مرغ": "Egg", "گوجه": "Tomato", "سیب زمینی": "Potato",
                    "قارچ": "Mushroom", "پنیر": "Cheese"
                };

                const translateLine = (line) => {
                    let translated = line;
                    Object.keys(commonTerms).forEach(key => {
                        translated = translated.replace(new RegExp(key, 'g'), commonTerms[key]);
                    });
                    return translated;
                };

                const translatedIngredients = recipe.ingredients
                    ? recipe.ingredients.map(ing => translateLine(ing))
                    : [];

                resolve({
                    name: baseTranslation.name,
                    description: baseTranslation.description,
                    ingredients: translatedIngredients.length > 0 ? translatedIngredients : ["Ingredients not available in English yet."],
                    instructions: [
                        `1. Prepare the ingredients listed above for ${recipe.name}.`,
                        "2. Combine the ingredients in a suitable pot or pan.",
                        "3. Cook according to standard methods for this type of dish (fry, boil, or bake as needed).",
                        "4. Season with salt and spices to taste.",
                        "5. Serve warm and enjoy your meal.",
                        "(Note: This is an automatically generated placeholder translation. Add VITE_OPENAI_API_KEY to .env for real AI translation.)"
                    ]
                });
            }, 600);
        });
    }

    // Real API Call
    try {
        const prompt = `
        You are a professional translator and chef. 
        Translate the following Farsi recipe into English. 
        Return ONLY a valid JSON object with this structure:
        {
            "name": "English Name",
            "description": "A short appetizing description (max 20 words)",
            "ingredients": ["Ingredient 1", "Ingredient 2"],
            "instructions": ["Step 1", "Step 2"]
        }

        Recipe Name: ${recipe.name}
        Recipe Content: ${recipe.recipe}
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content;

    } catch (error) {
        console.error("AI Translation failed:", error);
        return null;
    }
};
