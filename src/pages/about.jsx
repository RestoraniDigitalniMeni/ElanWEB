import { Link } from "react-router-dom";
import "./about.css";

function About() {
  return (
    <div className="about-page">

      {/* GLAVNI SADRŽAJ */}
      <div className="about-card">

        <div className="about-content">

          {/* LOGO */}
         <img
  src="https://scontent.ftgd4-1.fna.fbcdn.net/v/t39.30808-6/291425323_408948101287911_8467128459772071063_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1080&ctp=s1080x1080&_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ipIgNg4aFiwQ7kNvwGz0LaG&_nc_oc=Ado9k9BWAVa851fBI3rVVIP4wHh0x_1zIjdVNYB0brdElJOjvt839sV2QaaADln-hXE&_nc_zt=23&_nc_ht=scontent.ftgd4-1.fna&_nc_gid=t38PPYGUqR6SLHqUIdfxHA&_nc_ss=7b2a8&oh=00_AQEQ6xaFhgeO8yjkbJj0QBhrNFDlObvz_kGZ0Q21UfhtCQ&oe=6A9371F1"
  alt="Vaš restoran"
  className="about-logo"
/>

          {/* NAZIV */}
          <h1>Vaš restoran</h1>

          {/* OPIS APLIKACIJE */}
          <div className="about-description">

            <p>
              Aplikacija je namijenjena osoblju restorana i podijeljena je na
              tri uloge korisnika: <strong>Administratori, Konobari i Kuhinja.</strong>
              Svaka uloga posjeduje određena prava pristupa i funkcionalnosti.
            </p>

            <p>
              <strong>Administratori</strong> imaju potpuni pristup svim
              funkcijama aplikacije, uključujući pregled statistike korisnika,
              pregled narudžbi i storniranje računa u slučaju greške prilikom
              izdavanja narudžbe. Prilikom storniranja računa ukupna zarada
              ostaje nepromijenjena. Nakon storniranja potrebno je obavijestiti
              kuhinju kako bi se spriječila priprema otkazane narudžbe.
            </p>

            <p>
              <strong>Konobari</strong> koriste opciju „Naruči hranu“, gdje mogu
              unijeti dodatne informacije vezane za narudžbu, odabrati željene
              artikle i potvrditi slanje narudžbe. Takođe imaju mogućnost
              pregleda svog pazara i prijave pazara na kraju smjene.
              Račune nije preporučljivo brisati prije završetka smjene.
            </p>

            <p>
              <strong>Kuhinja</strong> prima notifikacije o novim narudžbama
              zajedno sa listom poručenih artikala i dodatnim informacijama.
              Nakon pripreme i izdavanja hrane potrebno je kliknuti na dugme
              „Završi narudžbu“.
            </p>

            <p>
              Prilikom registracije korisničkog naloga neophodno je unijeti
              tačne i potpune podatke kako bi aplikacija funkcionisala pravilno.
            </p>

          </div>

        </div>

      </div>


      {/* PRAVNE INFORMACIJE */}
      <div className="about-card legal-card">

        <div className="about-content">

          <h2>Pravne informacije</h2>

          <Link to="/uslovi" className="about-link">
            Uslovi korišćenja
          </Link>

          <Link to="/politika" className="about-link">
            Politika privatnosti
          </Link>

        </div>

      </div>


      {/* PODRŠKA */}
      <div className="about-card support-card">

        <div className="about-content">

          <h2>Podrška</h2>

          <p>
            Za sva pitanja, probleme ili dodatne informacije možete nas
            kontaktirati putem korisničke podrške.
          </p>

        </div>

      </div>


      {/* COPYRIGHT */}
      <div className="about-copyright">
        © 2026 Vaš restoran. Sva prava zadržana.
      </div>

    </div>
  );
}

export default About;