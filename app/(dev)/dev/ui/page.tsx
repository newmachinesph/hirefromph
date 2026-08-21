import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardMedia,
  Checkbox,
  DiagramFrame,
  EmptyState,
  Field,
  Figure,
  Heading,
  ICON_NAMES,
  Icon,
  Input,
  Kicker,
  ProgressBar,
  Radio,
  Select,
  Source,
  SourceList,
  Stat,
  StatStrip,
  Step,
  StepList,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textarea,
} from "@/components/ui";
import {
  Breadcrumb,
  CardGrid,
  Container,
  CtaBand,
  FeatureRow,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import { ACCENTS } from "@/lib/accent";
import { ChoiceCardDemo, DialogDemo, RangeDemo, SwitchDemo } from "./demos";

export const metadata = {
  title: "UI gallery",
  robots: { index: false, follow: false },
};

// `ACCENTS` already includes "neutral" as its first member (see lib/accent.ts),
// so the tone list is just the accent list itself — prepending "neutral" here
// would duplicate it and produce duplicate React keys below.
const TONES = ACCENTS;

function Bay({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-line py-10">
      <Heading level={2} size="h3" id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
        {title}
      </Heading>
      {children}
    </section>
  );
}

export default function DevUiGallery() {
  // Development-only surface: never shipped, never indexed.
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "UI gallery" }]}
        kicker="Development only"
        kickerTone="signal"
        title="Every primitive, every"
        accent="variant."
        lead="The screenshot target for component review. This route 404s in production and is excluded from the sitemap and robots."
        actions={
          <>
            <Button href="/">Back to the site</Button>
            <Button href="#buttons" variant="outline">
              Jump to buttons
            </Button>
          </>
        }
        compact
      />

      <Container>
        <Bay title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/start" icon={<Icon name="compass" size={18} />}>
              Internal link
            </Button>
            <Button href="https://psa.gov.ph" external variant="outline" iconEnd={<Icon name="arrow-up-right" size={16} />}>
              External link
            </Button>
          </div>
        </Bay>

        <Bay title="Badges and kickers">
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Badge key={`soft-${tone}`} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Badge key={`outline-${tone}`} tone={tone} variant="outline">
                {tone}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <Kicker key={`kicker-${tone}`} tone={tone}>
                {tone}
              </Kicker>
            ))}
          </div>
        </Bay>

        <Bay title="Type scale">
          <Heading level={2} size="hero" accent="online.">
            Build a career
          </Heading>
          <Heading level={2} size="display">
            Display
          </Heading>
          <Heading level={2} size="h2">
            Heading 2
          </Heading>
          <Heading level={3} size="h3">
            Heading 3
          </Heading>
          <Heading level={4} size="h4">
            Heading 4
          </Heading>
          <Heading level={5} size="h5">
            Heading 5
          </Heading>
          <Text size="lead">Lead — the sentence under a headline.</Text>
          <Text size="body">Body — long-form prose at 18px.</Text>
          <Text size="base">Base — UI and card copy at 16px.</Text>
          <Text size="small">Small — labels and metadata at 15px.</Text>
          <Text size="caption" tone="faint">
            Caption — captions and source lines at 13px.
          </Text>
        </Bay>

        <Bay title="Cards">
          <CardGrid cols={3}>
            <Card>
              <Heading level={3} size="h5">
                Plain card
              </Heading>
              <Text size="small">Bordered, never shadowed.</Text>
            </Card>
            <Card interactive>
              <Heading level={3} size="h5">
                Interactive
              </Heading>
              <Text size="small">Hover changes border and background only.</Text>
            </Card>
            <Card href="/start" padding="none">
              <CardMedia ratio="3/2">
                <Figure id="stage-start" ratio="3/2" radius="none" />
              </CardMedia>
              <CardBody>
                <Heading level={3} size="h5">
                  Media card
                </Heading>
                <Text size="small">The whole card is the link.</Text>
              </CardBody>
              <CardFooter>
                <Badge tone="signal">Stage 1</Badge>
              </CardFooter>
            </Card>
          </CardGrid>
        </Bay>

        <Bay title="Form controls">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Your name" hint="However you introduce yourself at work.">
              <Input placeholder="Maria Santos" />
            </Field>
            <Field label="Email" error="Enter a valid email." required>
              <Input type="email" defaultValue="not-an-email" />
            </Field>
            <Field label="What do you do?" hint="Two sentences is plenty.">
              <Textarea placeholder="I keep books for two Australian clients…" />
            </Field>
            <Field label="Stage">
              <Select defaultValue="2">
                <option value="1">Stage 1 — Start</option>
                <option value="2">Stage 2 — Get hired</option>
                <option value="3">Stage 3 — Deliver</option>
              </Select>
            </Field>
          </div>

          <Field as="group" label="Which apply?" hint="Pick as many as you like.">
            <Checkbox name="tools" value="sheets" label="Spreadsheets" defaultChecked />
            <Checkbox name="tools" value="crm" label="A CRM" />
            <Checkbox name="tools" value="none" label="Nothing yet" disabled />
          </Field>

          <Field as="group" label="How do you work?">
            <Radio name="mode" value="hourly" label="Hourly" defaultChecked />
            <Radio name="mode" value="retainer" label="Retainer" />
            <Radio name="mode" value="project" label="Per project" />
          </Field>

          <ChoiceCardDemo />
          <RangeDemo />
          <SwitchDemo />
        </Bay>

        <Bay title="Tabs">
          <Tabs defaultValue="agency">
            <TabList label="Client type">
              <Tab value="agency" icon={<Icon name="building-2" size={18} />}>
                Agency
              </Tab>
              <Tab value="direct" icon={<Icon name="handshake" size={18} />}>
                Direct
              </Tab>
              <Tab value="platform" disabled>
                Platform (disabled)
              </Tab>
            </TabList>
            <TabPanel value="agency">
              <Text>The agency holds the relationship. You hold the craft.</Text>
            </TabPanel>
            <TabPanel value="direct">
              <Text>You hold the relationship, the scope and the invoice.</Text>
            </TabPanel>
            <TabPanel value="platform">
              <Text>The platform holds the relationship.</Text>
            </TabPanel>
          </Tabs>
        </Bay>

        <Bay title="Accordion">
          <Accordion type="single" defaultOpen="free">
            <AccordionItem id="free" title="Is it really free?">
              Yes. Walang bayad, walang catch. Nothing here is gated.
            </AccordionItem>
            <AccordionItem id="degree" title="Do I need a degree?">
              No. You need evidence you can do the work.
            </AccordionItem>
            <AccordionItem id="ai" title="Is AI taking these jobs?">
              It is changing them. Read the sourced version on Reality Check.
            </AccordionItem>
          </Accordion>
        </Bay>

        <Bay title="Dialog">
          <DialogDemo />
        </Bay>

        <Bay title="Stats, callouts and sources">
          <StatStrip>
            <Stat value="5" label="Stages" sub="Start to Own" />
            <Stat value="11" label="Steps" />
            <Stat value="22" label="Niches" />
            <Stat value="40" label="Micro-tasks" />
          </StatStrip>

          <div className="grid gap-4 sm:grid-cols-2">
            {TONES.map((tone) => (
              <Callout key={`callout-${tone}`} tone={tone} title={`${tone} callout`} icon="lightbulb">
                One idea, stated once, with the source underneath it.
              </Callout>
            ))}
          </div>

          <SourceList
            sources={[
              { label: "PSA Labour Force Survey", url: "https://psa.gov.ph", date: "2026-03-01" },
              { label: "Agency rate guide", url: "https://example.com/guide", grade: "vendor" },
            ]}
          />
          <Source label="BIR Revenue Regulations" url="https://bir.gov.ph" />
        </Bay>

        <Bay title="Steps, progress and empty states">
          <StepList>
            <Step n={1} title="Pick a path">
              Twenty-two niches, filtered by what you already know.
            </Step>
            <Step n={2} title="Follow five stages">
              Eleven steps, in order, with a tool at each one.
            </Step>
            <Step n={3} title="Build every deliverable yourself">
              You write it. You own it.
            </Step>
          </StepList>

          <div className="flex max-w-md flex-col gap-4">
            <ProgressBar label="Stage 2 progress" value={2} max={3} showValue />
            <ProgressBar label="Plan days done" value={12} max={30} tone="verified" showValue />
          </div>

          <EmptyState
            title="No applications logged yet"
            body="The tracker fills up as you apply. Nothing here is sent anywhere — it lives in this browser."
            icon="clipboard-list"
            action={<Button href="/apply">Find your first opportunity</Button>}
          />
        </Bay>

        <Bay title="Figure and DiagramFrame">
          <div className="grid gap-6 sm:grid-cols-2">
            <Figure id="home-hero" ratio="hero" caption="Manifest entry (data/visuals.json)" />
            <Figure id="does-not-exist" ratio="3/2" />
          </div>

          <DiagramFrame
            title="The path, end to end"
            caption="Five stages, eleven steps. Look at where the steps cluster."
          >
            <div className="flex items-center gap-3">
              {["Start", "Get hired", "Deliver", "Level up", "Own"].map((stage, index) => (
                <div key={stage} className="flex items-center gap-3">
                  <div className="rounded-sm border border-line px-4 py-3 text-small text-ink">
                    {index + 1}. {stage}
                  </div>
                  {index < 4 && <span aria-hidden className="text-ink-faint">→</span>}
                </div>
              ))}
            </div>
          </DiagramFrame>
        </Bay>

        <Bay title="Layout">
          <SectionHeading
            kicker="Section heading"
            title="Heading left, action right"
            lead="The Learnora pattern: the section says what it is, the action says where to go."
            action={<Button variant="outline">Browse everything</Button>}
          />
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "The Path", href: "/start" },
              { label: "Stage 2" },
            ]}
          />
          <FeatureRow
            items={[
              { icon: "compass", title: "Pick a path", body: "Choose from twenty-two niches." },
              { icon: "list-checks", title: "Follow five stages", body: "Eleven steps, in order." },
              { icon: "hammer", title: "Build it yourself", body: "Every deliverable is yours." },
            ]}
          />
          <Toc
            items={[
              { id: "buttons", label: "Buttons" },
              { id: "cards", label: "Cards" },
              { id: "layout", label: "Layout" },
            ]}
          />
          <PageFooterNav
            prev={{ label: "Foundations", href: "/" }}
            next={{ label: "Navigation", href: "/" }}
            up={{ label: "Back to your path", href: "/path" }}
          />
        </Bay>

        <Bay title="Icons">
          <Text size="small">{ICON_NAMES.length} names in the registry.</Text>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-3">
            {ICON_NAMES.map((name) => (
              <div
                key={name}
                className="flex flex-col items-center gap-1.5 rounded-sm border border-line p-3 text-center"
              >
                <Icon name={name} size={22} />
                <span className="text-caption break-all text-ink-faint">{name}</span>
              </div>
            ))}
          </div>
        </Bay>
      </Container>

      <Section band="tint">
        <SectionHeading
          kicker="Bands"
          title="A tint band"
          lead="Bands alternate paper and tint; never two in a row."
        />
      </Section>

      <CtaBand
        kicker="The one navy band"
        title="Start with Stage 1."
        body="One idea, one button. The navy band appears once per page, above the footer."
        actions={<Button href="/start">Find your path</Button>}
      />
    </>
  );
}
