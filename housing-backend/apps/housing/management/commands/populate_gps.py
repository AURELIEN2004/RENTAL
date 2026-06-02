# apps/housing/management/commands/populate_gps.py
# ============================================================
# Commande : python manage.py populate_gps
# But      : Attribue des coordonnées GPS aux logements
#            qui n'en ont pas encore, à partir du quartier/ville.
# ============================================================

from django.core.management.base import BaseCommand
from django.db.models import Q
from apps.housing.models import Housing
import random

# Coordonnées GPS par quartier (centre approximatif)
DISTRICT_COORDS = {
    # ─── Yaoundé ───────────────────────────────────────────
    'Bastos':        (3.8789, 11.5143),
    'Omnisport':     (3.8614, 11.5079),
    'Nlongkak':      (3.8652, 11.5217),
    'Biyem-Assi':    (3.8367, 11.4971),
    'Biyem Assi':    (3.8367, 11.4971),
    'Ngousso':       (3.8738, 11.5312),
    'Odza':          (3.8234, 11.5543),
    'Ekounou':       (3.8289, 11.5234),
    'Mvan':          (3.8145, 11.4989),
    'Melen':         (3.8512, 11.5156),
    'Elig-Essono':   (3.8567, 11.5067),
    'Elig Essono':   (3.8567, 11.5067),
    'Mokolo':        (3.8712, 11.4956),
    'Mvog-Mbi':      (3.8423, 11.5189),
    'Mvog Mbi':      (3.8423, 11.5189),
    'Essos':         (3.8631, 11.5356),
    'Mendong':       (3.8212, 11.4834),
    'Nkoldongo':     (3.8356, 11.5078),
    'Nsimeyong':     (3.8298, 11.5123),
    'Damas':         (3.8489, 11.5278),
    'Emana':         (3.8234, 11.5445),
    'Etoudi':        (3.8923, 11.5234),
    'Mimboman':      (3.8156, 11.5389),
    'Obili':         (3.8512, 11.4934),
    'Tsinga':        (3.8678, 11.5078),
    'Santa Barbara': (3.8845, 11.5189),
    'Nkolbisson':    (3.8678, 11.4567),
    'Simbock':       (3.8234, 11.5012),
    'Nkolmesseng':   (3.8156, 11.5678),
    'Centre ville':  (3.8687, 11.5174),
    'Centre-ville':  (3.8687, 11.5174),

    # ─── Douala ────────────────────────────────────────────
    'Bonapriso':     (4.0389, 9.7234),
    'Akwa':          (4.0511, 9.7143),
    'Bonanjo':       (4.0423, 9.7012),
    'Makepe':        (4.0756, 9.7543),
    'Deido':         (4.0623, 9.7389),
    'Bali':          (4.0445, 9.7267),
    'Kotto':         (4.0312, 9.7678),
    'Logbaba':       (4.0189, 9.7812),
    'Ndogbong':      (4.0867, 9.7456),
    'Bonamoussadi':  (4.0678, 9.7312),
    'New Bell':      (4.0534, 9.7089),
    'New-Bell':      (4.0534, 9.7089),
    'Bépanda':       (4.0612, 9.7456),
    'Bepanda':       (4.0612, 9.7456),
    'Ndokotti':      (4.0423, 9.7389),
    'Ange Raphael':  (4.0534, 9.7234),
    'Ange-Raphael':  (4.0534, 9.7234),
    'Village':       (4.0623, 9.7523),
    'Ndog-Bong':     (4.0867, 9.7456),

    # ─── Bafoussam ─────────────────────────────────────────
    'Banengo':       (5.4912, 10.4234),
    'Tamdja':        (5.4678, 10.4123),
    'Djeleng':       (5.4534, 10.4012),
}

# Coordonnées par ville (fallback si quartier inconnu)
CITY_COORDS = {
    'Yaoundé':    (3.8480, 11.5021),
    'Yaounde':    (3.8480, 11.5021),
    'Douala':     (4.0511, 9.7679),
    'Bafoussam':  (5.4764, 10.4180),
    'Bamenda':    (5.9597, 10.1463),
    'Kribi':      (2.9400, 9.9066),
    'Limbé':      (4.0231, 9.1972),
    'Limbe':      (4.0231, 9.1972),
    'Garoua':     (9.3014, 13.3922),
    'Maroua':     (10.5906, 14.3234),
    'Ngaoundéré': (7.3167, 13.5833),
    'Ngaoundere': (7.3167, 13.5833),
    'Bertoua':    (4.5833, 13.6833),
    'Buea':       (4.1527, 9.2416),
    'Edéa':       (3.7994, 10.1344),
    'Edea':       (3.7994, 10.1344),
    'Ebolowa':    (2.9000, 11.1500),
    'Sangmélima': (2.9456, 11.9814),
    'Sangmelima': (2.9456, 11.9814),
}


class Command(BaseCommand):
    help = 'Peuple les coordonnées GPS des logements sans coordonnées'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Mettre à jour même les logements qui ont déjà des coordonnées',
        )
        parser.add_argument(
            '--jitter',
            type=float,
            default=0.003,
            help='Amplitude de la variation aléatoire en degrés (défaut: 0.003 ≈ 300m)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Afficher ce qui serait fait sans modifier la base de données',
        )

    def handle(self, *args, **options):
        force   = options['force']
        jitter  = options['jitter']
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 Mode --dry-run : aucune modification'))

        if force:
            qs = Housing.objects.all()
            self.stdout.write(self.style.WARNING(
                f'⚠️  Mode --force : tous les logements seront mis à jour'
            ))
        else:
            qs = Housing.objects.filter(
                Q(latitude__isnull=True) | Q(longitude__isnull=True)
            )

        total         = qs.count()
        updated       = 0
        by_district   = 0
        by_city       = 0
        by_fallback   = 0

        self.stdout.write(f'\n📍 {total} logements à traiter...\n')

        for housing in qs:
            base_lat, base_lng = None, None
            source = ''

            # ── 1. Chercher par quartier ──────────────────────────
            if housing.district:
                district_name = housing.district.name
                if district_name in DISTRICT_COORDS:
                    base_lat, base_lng = DISTRICT_COORDS[district_name]
                    source = f'quartier "{district_name}"'
                    by_district += 1

            # ── 2. Fallback par ville ─────────────────────────────
            if base_lat is None and housing.city:
                city_name = housing.city.name
                if city_name in CITY_COORDS:
                    base_lat, base_lng = CITY_COORDS[city_name]
                    source = f'ville "{city_name}"'
                    by_city += 1

            # ── 3. Fallback Yaoundé ───────────────────────────────
            if base_lat is None:
                base_lat, base_lng = CITY_COORDS['Yaoundé']
                source = 'fallback Yaoundé (quartier+ville inconnus)'
                by_fallback += 1

            # ── Appliquer décalage aléatoire ──────────────────────
            final_lat = base_lat + random.uniform(-jitter, jitter)
            final_lng = base_lng + random.uniform(-jitter, jitter)

            self.stdout.write(
                f'  {"[DRY]" if dry_run else "✓"} #{housing.id} '
                f'"{housing.title[:40]}" → ({final_lat:.5f}, {final_lng:.5f}) '
                f'[{source}]'
            )

            if not dry_run:
                housing.latitude  = final_lat
                housing.longitude = final_lng
                housing.save(update_fields=['latitude', 'longitude'])

            updated += 1

        # ── Rapport final ──────────────────────────────────────────
        self.stdout.write('\n' + '─' * 60)
        if dry_run:
            self.stdout.write(self.style.WARNING(
                f'[DRY-RUN] {updated} logements auraient été mis à jour'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'✅ {updated} logements mis à jour\n'
                f'   ├─ Via quartier : {by_district}\n'
                f'   ├─ Via ville    : {by_city}\n'
                f'   └─ Fallback     : {by_fallback}\n'
            ))
            self.stdout.write(
                '\n💡 Vérification :\n'
                '   python manage.py shell -c "\n'
                '   from apps.housing.models import Housing; \n'
                '   print(Housing.objects.exclude(latitude__isnull=True).count(), '
                '"logements avec GPS")"'
            )