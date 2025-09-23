import React from 'react';
import Joyride, { CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useTour } from '../../contexts/TourContext';
import { onboardingSteps } from './tourSteps';

const OnboardingTour: React.FC = () => {
  const { isTourRunning, stopTour, stepIndex, setStepIndex } = useTour();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      stopTour();
      // Marcar que el tour ya se completó para no mostrarlo de nuevo
      localStorage.setItem('onboardingTourCompleted', 'true');
      setStepIndex(0); // Reinicia el índice para la próxima vez
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Actualiza el índice del paso en el contexto después de cada acción (siguiente/anterior)
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextStepIndex);
    }
  };

  return (
    <Joyride
      steps={onboardingSteps}
      run={isTourRunning}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
    />
  );
};

export default OnboardingTour;