'use client';

import * as React from 'react';
import BirthdayForm from '@/components/BirthdayForm';
import MilestoneList from '@/components/MilestoneList';
import type { Milestone } from '@/lib/milestones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [birthDate, setBirthDate] = React.useState<Date | null>(null);

  const handleMilestonesCalculated = (calculatedMilestones: Milestone[], date: Date) => {
    setMilestones(calculatedMilestones);
    setBirthDate(date);
  };

  return (
    <div className="flex flex-col items-center space-y-8 min-h-full">
      <header className="text-center space-y-2">
         <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-3">
          <PartyPopper className="w-10 h-10 text-accent" />
          ToastYourTime
        </h1>
        <p className="text-lg text-muted-foreground">
          Find your next reason to celebrate! Enter your birth date and time.
        </p>
      </header>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-secondary-foreground">Enter Your Birth Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BirthdayForm onMilestonesCalculated={handleMilestonesCalculated} />
        </CardContent>
      </Card>

      {milestones.length > 0 && birthDate && (
        <>
          <Separator className="my-8" />
          <MilestoneList milestones={milestones} birthDate={birthDate} />
        </>
      )}
    </div>
  );
}
