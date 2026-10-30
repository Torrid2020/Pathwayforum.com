export const UGANDA_PLACES = [
 'Uganda','Kampala','Entebbe','Jinja','Gulu','Mbarara','Fort Portal','Mukono','Wakiso','Arua','Lira','Mbale','Masaka','Hoima','Soroti','Kabale','Moroto','Kotido','Karamoja','Isingiro','Kiryandongo','Adjumani','Yumbe','Kasese','Tororo',
 'Nakaseke','Koboko','Nebbi','Pakwach','Moyo','Obongi','Kitgum','Lamwo','Pader','Amuru','Nwoya','Omoro','Agago','Kole','Oyam','Dokolo','Apac','Alebtong','Otuke','Luwero','Nakasongola','Mityana','Mubende','Kiboga','Kyankwanzi','Kayunga','Buikwe','Lugazi','Njeru','Iganga','Bugiri','Busia','Kamuli','Mayuge','Kaliro','Pallisa','Kumi','Katakwi','Kaberamaido','Kapchorwa','Sironko','Bududa','Kisoro','Ntungamo','Rukungiri','Kanungu','Bushenyi','Sheema','Mitooma','Ibanda','Kiruhura','Sembabule','Rakai','Kyotera','Kalangala','Buliisa','Masindi','Kibaale','Kagadi','Kakumiro','Kyenjojo','Kyegegwa','Kamwenge','Bundibugyo','Ntoroko','Kabarole','Bunyangabu','Nakivale','Palabek','Bidi Bidi'
];
const places = new RegExp('\\b(?:'+UGANDA_PLACES.map(place=>place.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'[ -]+')).join('|')+')\\b','i');
export const isUgandaLocation = value => places.test(String(value || ''));

// Keep only eligible alternatives when an ATS provides multiple distinct duty stations.
export function ugandaLocations(values) {
 return values.filter(isUgandaLocation).join('; ');
}
