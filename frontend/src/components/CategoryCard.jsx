import React from 'react';
import * as LucideIcons from 'lucide-react';

const CategoryCard = ({ category, selected, onClick, minWageFloor }) => {
  const IconComponent = LucideIcons[category.icon] || LucideIcons.Wrench;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group relative p-5 rounded-2xl border transition-all duration-200 ${
        selected
          ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-white border-teal-600 shadow-lg scale-[1.02]'
          : 'bg-white hover:bg-teal-50/50 border-slate-200 text-slate-800 hover:border-teal-300 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            selected
              ? 'bg-white/20 text-white'
              : 'bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white'
          }`}
        >
          <IconComponent className="w-6 h-6" />
        </div>
        {minWageFloor && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              selected
                ? 'bg-white/20 text-amber-200 border-white/30'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            Floor: ₹{minWageFloor}/hr
          </span>
        )}
      </div>

      <h3 className={`font-bold text-base mb-1 ${selected ? 'text-white' : 'text-slate-900'}`}>
        {category.name}
      </h3>
      <p
        className={`text-xs line-clamp-2 ${
          selected ? 'text-teal-100' : 'text-slate-500'
        }`}
      >
        {category.description || 'Verified cooperative workers available.'}
      </p>
    </div>
  );
};

export default CategoryCard;
