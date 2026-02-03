import { NextRequest, NextResponse } from 'next/server';

interface City {
  name: string;
  postalCode: string;
  lat: number;
  lng: number;
  department: string;
  region: string;
}

// API pour récupérer les villes à partir d'un code postal
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postalCode = searchParams.get('postalCode');
  const query = searchParams.get('q'); // Pour recherche par nom

  if (!postalCode && !query) {
    return NextResponse.json(
      { success: false, error: 'postalCode ou q requis' },
      { status: 400 }
    );
  }

  try {
    let cities: City[] = [];

    if (postalCode) {
      // Recherche par code postal via l'API gouvernementale française
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom,codesPostaux,centre,codeDepartement,codeRegion&format=json`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        cities = data.map((commune: any) => ({
          name: commune.nom,
          postalCode: postalCode,
          lat: commune.centre?.coordinates?.[1] || 0,
          lng: commune.centre?.coordinates?.[0] || 0,
          department: commune.codeDepartement || '',
          region: commune.codeRegion || '',
        }));
      }
    } else if (query) {
      // Recherche par nom de ville
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux,centre,codeDepartement,codeRegion&format=json&limit=10`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        cities = data.map((commune: any) => ({
          name: commune.nom,
          postalCode: commune.codesPostaux?.[0] || '',
          lat: commune.centre?.coordinates?.[1] || 0,
          lng: commune.centre?.coordinates?.[0] || 0,
          department: commune.codeDepartement || '',
          region: commune.codeRegion || '',
        }));
      }
    }

    return NextResponse.json({
      success: true,
      cities,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}
