"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { getChoseong } from "es-hangul";

enum PassType {
  EARLY_LEAVE = "EARLY_LEAVE",
  OUTING = "OUTING",
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isTeacher: boolean;
}

interface FormData {
  type: PassType | "";
  startTime: string;
  returnTime: string | null;
  reason: string;
  teacherId: string;
}

export default function NewPassPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    startTime: "",
    returnTime: null,
    reason: "",
    teacherId: "",
  });
  const [teachers, setTeachers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<User[]>([]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/status", {
        credentials: "include",
      });
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      if (data.isTeacher) {
        router.push("/");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/users/teachers", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
        setFilteredTeachers(data);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const searchResults = teachers.filter((teacher: User) => {
      const fullName = `${teacher.lastName}${teacher.firstName}`;
      const teacherChoseong = getChoseong(fullName).toLowerCase();
      const searchChoseong = getChoseong(term).toLowerCase();

      return teacherChoseong.includes(searchChoseong);
    });

    setFilteredTeachers(searchResults);
  };

  const handleTypeSelect = (type: PassType) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handleTimeSubmit = (startTime: string, returnTime?: string) => {
    setFormData({
      ...formData,
      startTime,
      returnTime: formData.type === PassType.OUTING ? returnTime || null : null,
    });
    setStep(3);
  };

  const handleReasonSubmit = (reason: string) => {
    setFormData({ ...formData, reason });
    setStep(4);
    fetchTeachers();
  };

  const handleTeacherSelect = async (teacherId: string) => {
    const requestData = {
      ...formData,
      teacherId,
      startTime: new Date(formData.startTime).toISOString(),
      returnTime: formData.returnTime
        ? new Date(formData.returnTime).toISOString()
        : null,
    };

    try {
      const response = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/pass/${data.id}`);
      } else {
        console.error("Failed to create pass:", await response.json());
      }
    } catch (error) {
      console.error("Failed to create pass:", error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>로드중...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.stepIndicator}>{step} / 4</div>
        {step === 1 && (
          <>
            <h1>패스 종류 선택</h1>
            <h2 className={styles.subText}>
              어떤 종류의 패스를 만들어야 하나요?
            </h2>
            <div className={styles.buttonContainer}>
              <button
                onClick={() => handleTypeSelect(PassType.EARLY_LEAVE)}
                className={styles.button}>
                조퇴증
              </button>
              <button
                onClick={() => handleTypeSelect(PassType.OUTING)}
                className={styles.button}>
                외출증
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>시간 선택</h1>
            <h2 className={styles.subText}>
              {formData.type === PassType.EARLY_LEAVE ? "조퇴" : "외출"} 시간을
              선택하세요.
            </h2>
            <div className={styles.timeInputs}>
              <div>
                <label>시작 시간</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              {formData.type === PassType.OUTING && (
                <div>
                  <label>복귀 시간</label>
                  <input
                    type="datetime-local"
                    value={formData.returnTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, returnTime: e.target.value })
                    }
                  />
                </div>
              )}
              <button
                onClick={() =>
                  handleTimeSubmit(
                    formData.startTime,
                    formData.returnTime || undefined
                  )
                }
                disabled={
                  !formData.startTime ||
                  (formData.type === PassType.OUTING && !formData.returnTime)
                }
                className={styles.nextButton}>
                다음
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>사유 작성</h1>
            <h2 className={styles.subText}>
              {formData.type === PassType.EARLY_LEAVE ? "조퇴" : "외출"}의
              사유를 작성하세요.
            </h2>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="사유를 입력하세요"
              className={styles.reasonInput}
            />
            <button
              onClick={() => handleReasonSubmit(formData.reason)}
              disabled={!formData.reason}
              className={styles.nextButton}>
              다음
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1>교사 선택</h1>
            <h2 className={styles.subText}>
              패스를 승인할 담임 교사를 검색하여 선택하세요.
            </h2>
            <input
              type="text"
              placeholder="교사 검색..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.teachersList}>
              {searchTerm.trim() === "" && (
                <div className={styles.placeholder}>검색어를 입력해주세요.</div>
              )}
              {searchTerm.trim() !== "" &&
                filteredTeachers.length > 0 &&
                filteredTeachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    onClick={() => handleTeacherSelect(teacher.id)}
                    className={styles.teacherButton}>
                    {teacher.lastName}
                    {teacher.firstName} 선생님
                  </button>
                ))}
              {searchTerm.trim() !== "" && filteredTeachers.length === 0 && (
                <div className={styles.noResults}>검색 결과가 없습니다.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
