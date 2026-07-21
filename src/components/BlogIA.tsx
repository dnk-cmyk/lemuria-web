import React from "react";
import { Newspaper, ArrowUpRight, BookOpen } from "lucide-react";
import { BlogPost } from "../types";

interface BlogIAProps {
  articles: BlogPost[];
  onTrackClick: (id: string) => void;
}

export default function BlogIA({ articles, onTrackClick }: BlogIAProps) {
  if (!articles || articles.length === 0) return null;

  const handleArticleClick = (article: BlogPost) => {
    onTrackClick(article.id);
    window.open(article.partnerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="blog-ia-section" className="py-16 bg-[#030712] border-t border-slate-900 text-slate-100 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(59,130,246,0.03),transparent_40%)] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-slate-850 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Newspaper className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="font-sans text-xl font-extrabold text-white tracking-tight">
                Blog Actualité IA & Tech
              </h2>
              <p className="text-xs text-slate-400">
                Restez à l'avant-garde de l'innovation et des technologies émergentes à Madagascar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 self-start sm:self-auto">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Mises à jour hebdomadaires</span>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article 
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className="group rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden flex flex-col justify-between hover:border-blue-500/30 hover:bg-slate-900/80 transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1"
            >
              <div>
                {/* Article Image Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Partenaire IA
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-300 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-0 flex justify-end">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-400 group-hover:text-blue-300 transition-colors uppercase tracking-wider">
                  <span>Lire l'article</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
