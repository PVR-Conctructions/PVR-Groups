require('dotenv').config();
const supabase = require('./config/supabase');

const fixPVRMeghaIcon = async () => {
    try {
        const { data: project } = await supabase.from('projects').select('id, categorized_images').eq('name', 'PVR Megha Icon').single();
        if (project && project.categorized_images) {
            const fixed = project.categorized_images.map(c => {
                if (c.url && !c.urls) {
                    return { category: c.category, urls: [c.url], label: c.category };
                }
                return c;
            });
            await supabase.from('projects').update({ categorized_images: fixed }).eq('id', project.id);
            console.log('Fixed DB successfully');
        }
    } catch (e) {
        console.error(e);
    }
};

fixPVRMeghaIcon();
