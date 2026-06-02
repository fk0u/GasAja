import { createFileRoute } from '@tanstack/react-router';
import { PlanDetail } from './$username.$slug';

export const Route = createFileRoute('/_auth/plan/$id')({
  component: PlanDetail,
});
