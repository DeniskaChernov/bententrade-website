import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShoppingBag, LayoutGrid, Building } from '../utils/lucide-stub';
import { Button } from './ui/button';
import { useLanguage } from '../utils/language-context';
import { trackEvent } from '../utils/analytics';

type PathId = 'A' | 'B' | 'C';

interface AudiencePathsSectionProps {
  onOpenFullCatalog: () => void;
  onScrollToHits: () => void;
  onScrollToQuote: () => void;
}

export function AudiencePathsSection({
  onOpenFullCatalog,
  onScrollToHits,
  onScrollToQuote,
}: AudiencePathsSectionProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const runPath = (id: PathId, action: () => void) => {
    trackEvent('audience_path_click', { audience_path: id });
    action();
  };

  const cards: Array<{
    id: PathId;
    badge: string;
    icon: typeof ShoppingBag;
    title: string;
    body: string;
    cta: string;
    onClick: () => void;
  }> = [
    {
      id: 'A',
      badge: 'A',
      icon: ShoppingBag,
      title: t.audiencePathNewTitle,
      body: t.audiencePathNewBody,
      cta: t.audiencePathNewCta,
      onClick: () => runPath('A', onScrollToHits),
    },
    {
      id: 'B',
      badge: 'B',
      icon: LayoutGrid,
      title: t.audiencePathProTitle,
      body: t.audiencePathProBody,
      cta: t.audiencePathProCta,
      onClick: () => runPath('B', onOpenFullCatalog),
    },
    {
      id: 'C',
      badge: 'C',
      icon: Building,
      title: t.audiencePathB2BTitle,
      body: t.audiencePathB2BBody,
      cta: t.audiencePathB2BCta,
      onClick: () => runPath('C', onScrollToQuote),
    },
  ];

  return (
    <section
      id="audience-paths"
      className="relative py-16 md:py-20 border-b border-primary/10"
      aria-labelledby="audience-paths-heading"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2
            id="audience-paths-heading"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-balance font-grotesk"
          >
            {t.audiencePathsTitle}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground text-balance">
            {t.audiencePathsSubtitle}
          </p>
        </motion.div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-24px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -6,
                      transition: { type: 'spring', stiffness: 400, damping: 22 },
                    }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className="card-spotlight-hover group relative flex flex-col rounded-2xl border border-primary/15 bg-background/60 backdrop-blur-sm p-6 shadow-sm hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  aria-hidden
                >
                  {card.badge}
                </span>
                <card.icon className="w-5 h-5 text-primary/60" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold tracking-tight mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                {card.body}
              </p>
              <Button
                type="button"
                onClick={card.onClick}
                className="agency-cta-primary w-full rounded-xl text-primary-foreground hover:bg-primary/95 h-11 gap-2 micro-interaction shadow-sm"
              >
                {card.cta}
                <ArrowRight className="w-4 h-4 opacity-90" />
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
