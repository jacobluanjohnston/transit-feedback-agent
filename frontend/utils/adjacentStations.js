// utils/adjacentStations.js
// Minimal adjacency map – add more pairs as you bring in routes.
export const ADJACENT = {
    // MUNI Metro
    Powell:       ['Civic Center', 'Montgomery'],
    Montgomery:   ['Powell', 'Embarcadero'],
    Civic_Center: ['Powell', 'Van Ness'],

    // BART
    '16th St Mission': ['24th St Mission', 'Civic Center / UN Plaza'],
    '24th St Mission': ['16th St Mission', 'Glen Park'],

    // VTA LRT
    'Santa Clara & 1st': ['Convention Center', 'St James'],
    Winchester:         ['Bascom'],
};
