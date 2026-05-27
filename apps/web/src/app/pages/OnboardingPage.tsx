import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button, InputField, SelectField, AstraLogo } from '@figma/astraui';
import { Sparkles, Brain, Target, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrbiProfile } from '../OrbiProfileContext';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, updateProfile, markOnboarded } = useOrbiProfile();
  const [preferredName, setPreferredName] = useState(profile.preferredName);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [currentFocus, setCurrentFocus] = useState(profile.currentFocus);
  const [peakHours, setPeakHours] = useState(profile.peakHours);
  const [orbiTone, setOrbiTone] = useState(profile.orbiTone);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    updateProfile({
      preferredName: preferredName.trim(),
      jobTitle: jobTitle.trim(),
      currentFocus: currentFocus.trim(),
      peakHours,
      orbiTone,
    });

    markOnboarded();
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center bg-brand-tertiary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-corner-lg p-8 bg-surface-bg border border-white/10 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-3 mb-6">
              <AstraLogo size={36} />
              <div>
                <p className="text-video-title text-text-tertiary uppercase tracking-[0.2em]">Orbi setup</p>
                <h1 className="text-heading text-text-primary">Make Orbi feel like yours</h1>
              </div>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Preferred name"
                  value={preferredName}
                  placeholder="How should Orbi address you?"
                  onChange={setPreferredName}
                />
                <InputField
                  label="Job or role"
                  value={jobTitle}
                  placeholder="Designer, student, founder..."
                  onChange={setJobTitle}
                />
              </div>

              <InputField
                label="What are you trying to get done right now?"
                value={currentFocus}
                placeholder="Ship a project, get through the week, finish coursework..."
                onChange={setCurrentFocus}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="When do you focus best?"
                  type="time"
                  value={peakHours}
                  onChange={setPeakHours}
                />
                <SelectField
                  label="How should Orbi speak to you?"
                  value={orbiTone}
                  options={[
                    { value: 'energetic', label: 'Energetic' },
                    { value: 'calm', label: 'Calm' },
                    { value: 'direct', label: 'Direct' },
                    { value: 'playful', label: 'Playful' },
                  ]}
                  onChange={setOrbiTone}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="primary" type="submit" disabled={saving} iconStart={<Sparkles size={16} />}>
                  {saving ? 'Saving…' : 'Start using Orbi'}
                </Button>
                <Button
                  variant="neutral"
                  type="button"
                  onClick={() => {
                    markOnboarded();
                    navigate('/dashboard', { replace: true });
                  }}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </section>

          <aside className="rounded-corner-lg p-8 bg-[linear-gradient(160deg,rgba(82,80,243,0.18),rgba(13,148,136,0.10))] border border-white/10 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-corner-md p-3 bg-white/10">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <p className="text-label-sm text-text-secondary">What this unlocks</p>
                <h2 className="text-label text-text-primary">A setup that can adapt</h2>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { icon: Target, title: 'Personalized dashboard', body: 'Orbi can greet you by name and focus on your real priorities.' },
                { icon: Timer, title: 'Better timing', body: 'Your peak hours help Orbi place nudges when you can actually act.' },
                { icon: Sparkles, title: 'Tone control', body: 'Choose how Orbi should talk so the app feels supportive, not noisy.' },
              ].map((item) => (
                <div key={item.title} className="rounded-corner-md p-4 bg-black/20 border border-white/10 flex gap-3">
                  <div className="rounded-full p-2 bg-white/10 h-fit">
                    <item.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-label-sm text-text-primary">{item.title}</p>
                    <p className="text-label-sm text-text-secondary">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}