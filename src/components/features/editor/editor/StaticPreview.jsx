import React from 'react'

const StaticPreview = ({ scene, isThumbnail = true }) => {
    const layout = scene.layout?.toLowerCase() || 'hero';
    const title = (scene.titleText || '').toLowerCase();
    
    // Core Layout Colors
    const COLORS = {
        bg: '#f1f5f9',
        text: '#94a3b8',
        mediaGradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        secondary: '#cbd5f5'
    }

    const containerStyle = {
        backgroundColor: COLORS.bg,
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isThumbnail ? '16px' : '32px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    }

    // Helper components
    const Block = ({ width, height, radius = '8px', gradient = false, style = {} }) => (
        <div style={{
            width: width,
            height: height,
            borderRadius: radius,
            background: gradient ? COLORS.mediaGradient : COLORS.text,
            ...style
        }} />
    );

    const TextGroup = ({ align = 'left', count = 3, width = '100%', style = {} }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: width, alignItems: align === 'center' ? 'center' : 'flex-start', ...style }}>
            <Block width={align === 'center' ? '70%' : '90%'} height={isThumbnail ? '8px' : '16px'} />
            {count > 1 && <Block width={align === 'center' ? '40%' : '60%'} height={isThumbnail ? '4px' : '8px'} style={{ opacity: 0.6 }} />}
            {count > 2 && <Block width={align === 'center' ? '50%' : '75%'} height={isThumbnail ? '4px' : '8px'} style={{ opacity: 0.6 }} />}
            {count > 3 && <Block width={align === 'center' ? '30%' : '45%'} height={isThumbnail ? '4px' : '8px'} style={{ opacity: 0.4 }} />}
        </div>
    );

    const renderMockup = () => {
        // Priority 1: Specific Title Keywords

        // A. TESTIMONIAL
        if (title.includes('testimonial')) {
            return (
                <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Block width="32px" height="32px" radius="50%" gradient style={{ marginBottom: '8px' }} />
                    <Block width="80%" height="4px" />
                    <Block width="60%" height="4px" style={{ opacity: 0.6 }} />
                </div>
            );
        }

        // B. SINGLE NUMBER / BIG METRIC
        if (title.includes('single number') || title.includes('100%')) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <Block width="30%" height={isThumbnail ? '40px' : '80px'} radius="6px" gradient />
                    <Block width="60%" height="4px" />
                </div>
            );
        }

        // C. OUTRO / SINCERE / SOCIAL CLOSING
        if (title.includes('outro') || title.includes('sincere') || title.includes('social support')) {
            return (
                <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <TextGroup align="center" count={2} />
                    <Block width="20px" height="20px" radius="4px" gradient />
                </div>
            );
        }

        // D. TOPIC DEEP DIVE / EXPLAINER
        if (title.includes('deep dive') || title.includes('explainer')) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <Block width="20%" height="6px" gradient style={{ marginBottom: '4px' }} />
                    <TextGroup count={4} width="90%" />
                </div>
            );
        }

        // Priority 2: Generic Layout Checks

        // STATS / NUMBERS
        if (title.includes('stats') || title.includes('numbers')) {
            return (
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', flex: 1 }}>
                            <Block width="80%" height={isThumbnail ? '24px' : '48px'} radius="6px" />
                            <Block width="60%" height="4px" />
                        </div>
                    ))}
                </div>
            );
        }

        // PROCESS / STEPS
        if (title.includes('step') || title.includes('process')) {
            return (
                <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ position: 'relative', flex: 1 }}>
                            <Block width="100%" height={isThumbnail ? '32px' : '64px'} radius="8px" style={{ background: i === 2 ? COLORS.mediaGradient : COLORS.secondary }} />
                            <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: COLORS.text, fontSize: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i}</div>
                        </div>
                    ))}
                </div>
            );
        }

        // CENTERED CTA
        if (title.includes('cta') || title.includes('call to action')) {
            return (
                <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <TextGroup align="center" count={2} />
                    <Block width="40%" height={isThumbnail ? '14px' : '28px'} radius="6px" gradient />
                </div>
            );
        }

        // HERO VARIANTS
        if (layout === 'hero') {
            // Avatar Group Hero
            if (title.includes('avatar group')) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <TextGroup width="50%" />
                        <div style={{ display: 'flex', position: 'relative', width: '40%', height: '40px' }}>
                            <div style={{ position: 'absolute', left: 0, width: '30px', height: '30px', borderRadius: '50%', background: COLORS.mediaGradient, border: '2px solid white' }} />
                            <div style={{ position: 'absolute', left: '15px', width: '30px', height: '30px', borderRadius: '50%', background: COLORS.mediaGradient, border: '2px solid white', opacity: 0.8 }} />
                            <div style={{ position: 'absolute', left: '30px', width: '30px', height: '30px', borderRadius: '50%', background: COLORS.mediaGradient, border: '2px solid white', opacity: 0.6 }} />
                        </div>
                    </div>
                );
            }
            // Right Text + Left Image
            if (title.includes('right text') || title.includes('left image')) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
                        <Block width="45%" height="70%" gradient />
                        <TextGroup width="45%" />
                    </div>
                );
            }
            // Centered Hero
            if (title.includes('centered')) {
                return (
                    <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <TextGroup align="center" width="80%" />
                        <Block width="20px" height="20px" radius="50%" gradient />
                    </div>
                );
            }
            // Default: Left Text + Right Image
            return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
                    <TextGroup width="45%" />
                    <Block width="45%" height="70%" gradient />
                </div>
            );
        }

        // SPLIT
        if (layout === 'split') {
            return (
                <div style={{ display: 'flex', width: '100%', height: '100%', gap: '4px' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                        <TextGroup />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                        <Block width="90%" height="80%" gradient />
                    </div>
                </div>
            );
        }

        // GRID
        if (layout === 'grid') {
            return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
                    <Block width="100%" height={isThumbnail ? '30px' : '60px'} radius="6px" gradient />
                    <Block width="100%" height={isThumbnail ? '30px' : '60px'} radius="6px" gradient />
                    <Block width="100%" height={isThumbnail ? '30px' : '60px'} radius="6px" gradient />
                </div>
            );
        }

        // STORY
        if (layout === 'story') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <Block width="100%" height="25%" radius="4px" />
                    <Block width="100%" height="25%" radius="4px" gradient />
                    <Block width="100%" height="25%" radius="4px" />
                </div>
            );
        }

        return <Block width="60%" height="60%" gradient radius="12px" />;
    };

    return (
        <div style={containerStyle}>
            {renderMockup()}
        </div>
    )
}

export default StaticPreview
