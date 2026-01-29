import {
    MdTextFields,
    MdCategory,
    MdAdd,
    MdTimer,
    MdArrowForward,
    MdGridView,
    MdCompareArrows,
    MdLightbulbOutline,
    MdPerson,
    MdPlayCircleOutline,
} from 'react-icons/md'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import avatar4 from '../assets/avatar4.png'
import avatar5 from '../assets/avatar5.png'

export const predefinedAvatars = [
    { id: 'avatar1', name: 'Avatar 1', image: avatar1 },
    { id: 'avatar2', name: 'Avatar 2', image: avatar2 },
    { id: 'avatar3', name: 'Avatar 3', image: avatar3 },
    { id: 'avatar4', name: 'Avatar 4', image: avatar4 },
    { id: 'avatar5', name: 'Avatar 5', image: avatar5 },
]

export const predefinedMedia = [
    { id: 'm1', name: 'Abstract Tech', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070', type: 'image' },
    { id: 'm2', name: 'Nature Peak', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070', type: 'image' },
    { id: 'm3', name: 'Modern Office', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070', type: 'image' },
    { id: 'm4', name: 'City Lights', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2070', type: 'image' },
    { id: 'm5', name: 'Minimal Workspace', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=500', full: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070', type: 'image' },
]

export const pageTemplates = [
    {
        id: 'split-right',
        name: 'Classic Right',
        layout: 'split-right',
        description: 'Title on left, avatar on right.',
        icon: <MdTextFields />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Insert your video title here' },
            { key: 'subtitleText', label: 'Subtitle', type: 'text', default: 'Add sub-headline here' }
        ]
    },
    {
        id: 'split-left',
        name: 'Classic Left',
        layout: 'split-left',
        description: 'Avatar on left, title on right.',
        icon: <MdTextFields />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Insert your video title here' },
            { key: 'subtitleText', label: 'Subtitle', type: 'text', default: 'Add sub-headline here' }
        ]
    },
    {
        id: 'centered',
        name: 'Centered',
        layout: 'centered',
        description: 'All content centered.',
        icon: <MdCategory />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Centered Title' },
            { key: 'subtitleText', label: 'Subtitle', type: 'text', default: 'Centered Subtitle' }
        ]
    },
    {
        id: 'bullets',
        name: 'Bullet Points',
        layout: 'bullets',
        description: 'Title with bullet points.',
        icon: <MdAdd />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Key Highlights' },
            { key: 'bullet1', label: 'Point 1', type: 'text', default: 'First important point' },
            { key: 'bullet2', label: 'Point 2', type: 'text', default: 'Second important point' },
            { key: 'bullet3', label: 'Point 3', type: 'text', default: 'Third important point' }
        ]
    },
    {
        id: 'stats',
        name: 'Statistics',
        layout: 'stats',
        description: 'Big numbers and metrics.',
        icon: <MdTimer />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Our Growth' },
            { key: 'stat1_value', label: 'Stat 1 Value', type: 'text', default: '98%' },
            { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', default: 'Customer Satisfaction' },
            { key: 'stat2_value', label: 'Stat 2 Value', type: 'text', default: '10k+' },
            { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', default: 'Active Users' }
        ]
    },
    {
        id: 'quote',
        name: 'Bold Quote',
        layout: 'quote',
        description: 'Full width bold statement.',
        icon: <MdTextFields />,
        fields: [
            { key: 'titleText', label: 'Quote', type: 'textarea', default: '"The best way to predict the future is to create it."' },
            { key: 'subtitleText', label: 'Author', type: 'text', default: 'Peter Drucker' }
        ]
    },
    {
        id: 'steps',
        name: 'Process Steps',
        layout: 'steps',
        description: 'Horizontal flow of steps.',
        icon: <MdArrowForward />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Our Process' },
            { key: 'step1', label: 'Step 1', type: 'text', default: 'Discovery' },
            { key: 'step2', label: 'Step 2', type: 'text', default: 'Strategy' },
            { key: 'step3', label: 'Step 3', type: 'text', default: 'Execution' }
        ]
    },
    {
        id: 'grid',
        name: 'Feature Grid',
        layout: 'grid',
        description: '4 features in a grid layout.',
        icon: <MdGridView />,
        fields: [
            { key: 'titleText', label: 'Title', type: 'text', default: 'Key Features' },
            { key: 'feat1', label: 'Feature 1', type: 'text', default: 'High Performance' },
            { key: 'feat2', label: 'Feature 2', type: 'text', default: 'Secure Data' },
            { key: 'feat3', label: 'Feature 3', type: 'text', default: '24/7 Support' },
            { key: 'feat4', label: 'Feature 4', type: 'text', default: 'Easy Integration' }
        ]
    },
    {
        id: 'comparison',
        name: 'Comparison',
        layout: 'comparison',
        description: 'Compare two concepts side by side.',
        icon: <MdCompareArrows />,
        fields: [
            { key: 'titleText', label: 'Comparison', type: 'text', default: 'Old vs Newway' },
            { key: 'leftItem', label: 'Left Item', type: 'text', default: 'Manual Work' },
            { key: 'rightItem', label: 'Right Item', type: 'text', default: 'AI Automation' }
        ]
    },
    {
        id: 'highlight',
        name: 'Modern Highlight',
        layout: 'highlight',
        description: 'Focus on one big feature or idea.',
        icon: <MdLightbulbOutline />,
        fields: [
            { key: 'titleText', label: 'Header', type: 'text', default: 'Innovation First' },
            { key: 'subtitleText', label: 'Subheader', type: 'text', default: 'Redefining the industry standards' },
            { key: 'highlightText', label: 'Main Point', type: 'text', default: 'Generate videos 10x faster' }
        ]
    },
    {
        id: 'testimonial',
        name: 'Social Proof',
        layout: 'testimonial',
        description: 'Structure for customer reviews.',
        icon: <MdPerson />,
        fields: [
            { key: 'titleText', label: 'Review Header', type: 'text', default: 'What our clients say' },
            { key: 'testimonialText', label: 'Testimonial', type: 'textarea', default: 'This tool has completely changed how we approach video production. Highly recommended!' },
            { key: 'author', label: 'Client Name', type: 'text', default: 'Sarah Johnson' },
            { key: 'role', label: 'Client Role', type: 'text', default: 'CEO at TechFlow' }
        ]
    },
    {
        id: 'cta',
        name: 'Final CTA',
        layout: 'cta',
        description: 'Perfect ending for your video.',
        icon: <MdPlayCircleOutline />,
        fields: [
            { key: 'titleText', label: 'Main Heading', type: 'text', default: 'Start Your Journey Today' },
            { key: 'subtitleText', label: 'Secondary Text', type: 'text', default: 'Join over 10,000+ satisfied creators.' },
            { key: 'website', label: 'Website/Link', type: 'text', default: 'www.athenavi.com' }
        ]
    }
]

export const avatarUrl =
    'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='
export const localAvatar = '/public/Avatar.png'
