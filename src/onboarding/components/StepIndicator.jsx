import { createElement } from '@wordpress/element';

const STEP_LABELS = ['Welcome', 'Provider', 'Generate', 'Done'];

export default function StepIndicator({ current, total }) {
    return (
        createElement('div', { className: 'mlo-steps' },
            STEP_LABELS.slice(0, total).map((label, i) => {
                const state = i < current ? 'done' : i === current ? 'active' : 'idle';
                return createElement('div', { key: i, className: `mlo-step-item mlo-step-${state}` },
                    createElement('div', { className: 'mlo-step-dot' },
                        state === 'done'
                            ? createElement('svg', { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none' },
                                createElement('path', { d: 'M1.5 5L4 7.5L8.5 2.5', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })
                            )
                            : createElement('span', null, i + 1)
                    ),
                    createElement('span', { className: 'mlo-step-label' }, label),
                    i < total - 1 && createElement('div', { className: 'mlo-step-line' })
                );
            })
        )
    );
}
