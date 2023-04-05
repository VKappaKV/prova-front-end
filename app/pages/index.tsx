import TopNavbar from "@/src/UI/Navbar";
import Head from "next/head";
import ReadContract from "../src/components/ReadContract";
import styles from "../styles/Home.module.css";
import UserInfo from "@/src/UI/UserInfo";

export default function Home() {
  return (
    <>
      <Head>
        <title>Helpy</title>
        <link rel="icon" href="/Crocerossa.png" />
        <style />
      </Head>
      <main>
        <TopNavbar />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            gap: "3vh",
          }}
        >
          <UserInfo />
          <h1>BENVENUTI SU HELPY </h1>
          <h4>Connetti wallet per iniziare</h4>
          <ReadContract />
        </div>
      </main>
    </>
  );
}
