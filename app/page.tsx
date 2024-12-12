"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isTeacher: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("인증 정보를 확인할 수 없음:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // const handleLogout = async () => {
  //   try {
  //     await fetch("/api/auth/logout", {
  //       method: "POST",
  //       credentials: "include",
  //     });
  //     setUser(null);
  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        {user ? (
          <>
            <h1 className={styles.welcomeText}>
              반가워요,
              <br /> {user.lastName}
              {user.firstName}
              {user.isTeacher ? " 선생" : ""}님!
            </h1>
            <h2 className={styles.subText}>필요한 서비스를 이용하세요.</h2>
            {/* <button className={styles.logoutButton} onClick={handleLogout}>
              로그아웃
            </button> */}
          </>
        ) : (
          <>
            <h1 className={styles.welcomeText}>환영합니다</h1>
            <h2 className={styles.subText}>
              학교 계정으로 로그인하여 시작하세요.
            </h2>
            <button className={styles.loginButton} onClick={handleLogin}>
              Google 로그인
            </button>
          </>
        )}

        {user && (
          <main>
            {user.isTeacher ? (
              <div className={styles.buttonContainer}>
                <button
                  className={styles.button}
                  onClick={() => router.push("/qr")}>
                  QR 찍기
                </button>
                <button
                  className={styles.button}
                  onClick={() => router.push("/passes")}>
                  대기 목록 보기
                </button>
              </div>
            ) : (
              <div className={styles.buttonContainer}>
                <button
                  className={styles.button}
                  onClick={() => router.push("/new")}>
                  패스 발급 받기
                </button>
                <button
                  className={styles.button}
                  onClick={() => router.push("/passes")}>
                  패스 목록 보기
                </button>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
